import type { TDeferred } from "@eoussama/core";

import type { TAnalysisSources, TAnalysisState, TCandidateRelations, TMissingItem } from "./types";

import type { TOwnedGame, TRelatedKind, TStoreItem } from "@/lib/steam";

import { deferred, toError } from "@eoussama/core";
import { AsyncQueuer } from "@tanstack/react-pacer";
import { Store } from "@tanstack/react-store";

import { classifyCandidate } from "./classify";



type TTask = { priority: number; attempt: number } & (
  | { kind: "dlc-batch"; appids: Array<number> }
  | { kind: "dlc"; appid: number }
  | { kind: "related"; relation: "franchise" | "studio"; search: TRelatedKind; name: string; owners: Array<number> }
);

export type TAnalyzerOptions = {
  /**
   * Whether an error means Steam is rate limiting. The analyzer then pauses and retries the task later.
   */
  isRateLimited?: (error: unknown) => boolean;
  /**
   * First pause after a rate limit, in milliseconds. Doubles on each consecutive rate limit.
   */
  cooldown?: number;
  /**
   * Longest pause after consecutive rate limits, in milliseconds.
   */
  maxCooldown?: number;
};

const CONCURRENCY = 4;
const BATCH_SIZE = 50;
const MAX_FRANCHISES = 200;
const MAX_STUDIOS = 30;
const MAX_ATTEMPTS = 5;
// Stryker disable next-line ArithmeticOperator: a default, the cap itself is tested through the `maxCooldown` option.
const MAX_COOLDOWN = 2 * 60 * 1000;
const BATCH_PRIORITY = Number.MAX_SAFE_INTEGER;
/**
 * Longest stretch of work before handing the main thread back, in milliseconds.
 */
const SLICE_DURATION = 10;
/**
 * Shortest interval between two published states while scanning, in milliseconds.
 */
const PUBLISH_INTERVAL = 150;

export const INITIAL_ANALYSIS_STATE: TAnalysisState = {
  phase: "idle",
  done: 0,
  total: 0,
  failed: 0,
  pausedUntil: null,
  items: new Map(),
  error: null,
};

function chunk<T>(values: ReadonlyArray<T>, size: number): Array<Array<T>> {
  const chunks: Array<Array<T>> = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

/**
 * @description
 * Lets the browser render and handle input before carrying on. Cached lookups resolve as microtasks, so without
 * this a fully cached run would hold the main thread until it completes.
 *
 * @returns A promise resolving on a later task.
 */
// Stryker disable all: yielding only changes when work runs, never its outcome.
function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;

  if (typeof scheduler?.yield === "function") {
    return scheduler.yield();
  }

  return new Promise((resolve) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}
// Stryker restore all

/**
 * @description
 * Finds the content missing from a Steam library. Work is split into prioritized tasks, most played games first,
 * and results are published to `store` as they arrive so the UI can render progressively.
 */
export class LibraryAnalyzer {
  readonly store = new Store<TAnalysisState>(INITIAL_ANALYSIS_STATE);

  private runId = 0;
  private queue: AsyncQueuer<TTask> | null = null;
  private finished: TDeferred<void> | null = null;
  private resumeTimer: ReturnType<typeof setTimeout> | null = null;
  private cooldown: number;
  private owned = new Set<number>();
  private ownedNames = new Map<number, string>();
  private relations = new Map<number, TCandidateRelations>();
  private hydrated = new Map<number, TStoreItem>();
  private requested = new Set<number>();
  private items = new Map<number, TMissingItem>();
  // Stryker disable next-line ObjectLiteral: every run resets it before use.
  private progress = { done: 0, failed: 0 };
  private publishTimer: ReturnType<typeof setTimeout> | null = null;
  private sliceStart = 0;
  private pendingYield: Promise<void> | null = null;

  private readonly baseCooldown: number;
  private readonly maxCooldown: number;
  private readonly isRateLimited: (error: unknown) => boolean;

  /**
   * @description
   * Creates an analyzer.
   *
   * @param sources - Data sources used to query Steam.
   * @param options - Analyzer options.
   */
  constructor(private readonly sources: TAnalysisSources, options: TAnalyzerOptions = {}) {
    this.baseCooldown = options.cooldown ?? 20_000;
    this.cooldown = this.baseCooldown;
    this.maxCooldown = options.maxCooldown ?? MAX_COOLDOWN;
    // Stryker disable next-line ArrowFunction: returning undefined is just as falsy.
    this.isRateLimited = options.isRateLimited ?? (() => false);
  }

  /**
   * @description
   * Analyzes a library, replacing the results of any previous run.
   *
   * @param games - Games in the library.
   * @returns A promise that settles once every task has completed, failed or been aborted.
   */
  async run(games: ReadonlyArray<TOwnedGame>): Promise<void> {
    this.abort();

    const runId = ++this.runId;
    const isCurrent = () => runId === this.runId;

    this.owned = new Set(games.map(game => game.appid));
    this.ownedNames = new Map(games.map(game => [game.appid, game.name]));
    this.relations = new Map();
    this.hydrated = new Map();
    this.requested = new Set();
    this.items = new Map();
    this.progress = { done: 0, failed: 0 };
    this.cooldown = this.baseCooldown;
    this.store.setState(() => ({ ...INITIAL_ANALYSIS_STATE, items: new Map(), phase: "library" }));

    try {
      const ownedItems = await this.sources.items([...this.owned]);

      if (!isCurrent()) {
        return;
      }

      const tasks = this.plan(games, ownedItems);

      this.store.setState(state => ({ ...state, phase: "scanning", total: tasks.length }));

      if (tasks.length > 0) {
        await this.process(tasks, isCurrent);
      }

      if (isCurrent()) {
        this.publish();
        this.store.setState(state => ({ ...state, phase: "done" }));
      }
    }
    catch (error) {
      if (isCurrent()) {
        this.publish();
        this.store.setState(state => ({ ...state, phase: "done", error: toError(error).message }));
      }
    }
  }

  /**
   * @description
   * Stops the current run. Requests already in flight complete but their results are discarded.
   */
  abort(): void {
    this.runId++;
    this.cancelPublish();

    // Stryker disable next-line ConditionalExpression,BlockStatement: cleanup only, the resume also checks its run is current.
    if (this.resumeTimer) {
      clearTimeout(this.resumeTimer);
      this.resumeTimer = null;
    }

    this.queue?.stop();
    this.queue?.clear();
    this.queue = null;
    this.finished?.resolve();
    this.finished = null;
  }

  private plan(games: ReadonlyArray<TOwnedGame>, ownedItems: ReadonlyArray<TStoreItem>): Array<TTask> {
    const items = new Map(ownedItems.map(item => [item.appid, item]));
    const playtime = new Map(games.map(game => [game.appid, game.playtimeMinutes]));
    const weigh = (owners: ReadonlyArray<number>) => owners.reduce((sum, appid) => sum + (playtime.get(appid) ?? 0) + 1, 0);

    const baseGames = [...games]
      .filter((game) => {
        const type = items.get(game.appid)?.type;

        return type === undefined || type === "game";
      })
      .sort((a, b) => b.playtimeMinutes - a.playtimeMinutes);

    const franchises = new Map<string, Array<number>>();
    const studios = new Map<string, Array<number>>();

    for (const game of baseGames) {
      const item = items.get(game.appid);

      for (const name of item?.franchises ?? []) {
        franchises.set(name, [...(franchises.get(name) ?? []), game.appid]);
      }

      for (const name of item?.developers ?? []) {
        studios.set(name, [...(studios.get(name) ?? []), game.appid]);
      }
    }

    const top = (groups: Map<string, Array<number>>, limit: number) =>
      [...groups].sort(([, a], [, b]) => weigh(b) - weigh(a)).slice(0, limit);

    return [
      ...chunk(baseGames.map(game => game.appid), BATCH_SIZE)
        .map((appids): TTask => ({ kind: "dlc-batch", appids, priority: BATCH_PRIORITY, attempt: 1 })),
      ...top(franchises, MAX_FRANCHISES)
        .map(([name, owners]): TTask => ({ kind: "related", relation: "franchise", search: "franchise", name, owners, priority: weigh(owners) * 2, attempt: 1 })),
      ...baseGames
        .map((game): TTask => ({ kind: "dlc", appid: game.appid, priority: game.playtimeMinutes + 1, attempt: 1 })),
      ...top(studios, MAX_STUDIOS)
        .map(([name, owners]): TTask => ({ kind: "related", relation: "studio", search: "developer", name, owners, priority: weigh(owners), attempt: 1 })),
    ];
  }

  private async process(tasks: ReadonlyArray<TTask>, isCurrent: () => boolean): Promise<void> {
    const finished = deferred<void>();
    let remaining = tasks.length;

    const settle = (failed: boolean) => {
      remaining--;

      if (isCurrent()) {
        this.progress.done++;
        this.progress.failed += failed ? 1 : 0;
        this.schedulePublish();
      }

      if (remaining === 0) {
        finished.resolve();
      }
    };

    const queue = new AsyncQueuer<TTask>(async (task) => {
      await this.yieldIfBusy();

      // Stryker disable next-line ConditionalExpression,BlockStatement: saves requests only, stale results are discarded after the lookup.
      if (!isCurrent()) {
        return;
      }

      try {
        await this.execute(task, isCurrent);
        this.cooldown = this.baseCooldown;
        settle(false);
      }
      catch (error) {
        if (!isCurrent()) {
          return;
        }

        if (this.isRateLimited(error) && task.attempt < MAX_ATTEMPTS) {
          this.pause(queue, isCurrent);
          queue.addItem({ ...task, attempt: task.attempt + 1 });

          return;
        }

        settle(true);
      }
    }, {
      concurrency: CONCURRENCY,
      // Stryker disable next-line BooleanLiteral: every task is queued before the first tick either way.
      started: false,
      getPriority: task => task.priority,
    });

    this.finished = finished;
    this.queue = queue;

    for (const task of tasks) {
      queue.addItem(task);
    }

    queue.start();

    await finished.promise;
  }

  /**
   * @description
   * Pauses the queue after a rate limit, backing off exponentially. Requests already in flight carry on.
   *
   * @param queue - Queue to pause.
   * @param isCurrent - Whether the run that hit the limit is still the current one.
   */
  private pause(queue: AsyncQueuer<TTask>, isCurrent: () => boolean): void {
    if (this.resumeTimer) {
      return;
    }

    const delay = this.cooldown;

    this.cooldown = Math.min(delay * 2, this.maxCooldown);
    queue.stop();
    this.publish();
    this.store.setState(state => ({ ...state, pausedUntil: Date.now() + delay }));

    this.resumeTimer = setTimeout(() => {
      this.resumeTimer = null;

      // Stryker disable next-line ConditionalExpression: abort clears this timer, so it never fires for a stale run.
      if (isCurrent()) {
        this.store.setState(state => ({ ...state, pausedUntil: null }));
        queue.start();
      }
    }, delay);
  }

  private async execute(task: TTask, isCurrent: () => boolean): Promise<void> {
    let candidates: Array<number> = [];

    if (task.kind === "dlc-batch") {
      const lists = await this.sources.dlcBatch(task.appids);

      for (const [parent, dlc] of Object.entries(lists)) {
        this.relate(dlc, "dlc", [Number(parent)]);
        candidates.push(...dlc);
      }
    }
    else if (task.kind === "dlc") {
      candidates = await this.sources.dlc(task.appid);
      this.relate(candidates, "dlc", [task.appid]);
    }
    else {
      candidates = await this.sources.related(task.search, task.name);
      this.relate(candidates, task.relation, task.owners);
    }

    if (isCurrent()) {
      await this.hydrate(candidates, isCurrent);
    }
  }

  private relate(appids: ReadonlyArray<number>, relation: keyof TCandidateRelations, owners: ReadonlyArray<number>): void {
    for (const appid of appids) {
      if (this.owned.has(appid)) {
        continue;
      }

      const relations = this.relations.get(appid) ?? { dlc: new Set(), franchise: new Set(), studio: new Set() };

      for (const owner of owners) {
        relations[relation].add(owner);
      }

      this.relations.set(appid, relations);
    }
  }

  private async hydrate(appids: ReadonlyArray<number>, isCurrent: () => boolean): Promise<void> {
    const missing = appids.filter(appid => !this.owned.has(appid) && !this.requested.has(appid));

    for (const appid of missing) {
      this.requested.add(appid);
    }

    let fetched: Array<TStoreItem> = [];

    try {
      // Stryker disable next-line ArrayDeclaration: an empty lookup adds nothing either way.
      fetched = missing.length > 0 ? await this.sources.items(missing) : [];
    }
    catch (error) {
      // Let a later attempt request these again.
      for (const appid of missing) {
        this.requested.delete(appid);
      }

      throw error;
    }

    if (!isCurrent()) {
      return;
    }

    for (const item of fetched) {
      this.hydrated.set(item.appid, item);
    }

    // Classify every candidate of this task, including ones hydrated by earlier tasks whose relations just grew.
    const updates = new Map<number, TMissingItem | null>();

    for (const appid of appids) {
      const item = this.hydrated.get(appid);

      if (item) {
        updates.set(appid, classifyCandidate(item, {
          owned: this.owned,
          ownedNames: this.ownedNames,
          relations: this.relations.get(appid),
        }));
      }
    }

    // Published when the task settles.
    for (const [appid, missingItem] of updates) {
      if (missingItem) {
        this.items.set(appid, missingItem);
      }
      else {
        this.items.delete(appid);
      }
    }
  }

  /**
   * @description
   * Hands the main thread back once the current slice of work is used up. Concurrent tasks share one yield so
   * they resume in the order they were started.
   *
   * @returns A promise resolving once work can carry on.
   */
  // Stryker disable all: yielding only changes when work runs, never its outcome.
  private async yieldIfBusy(): Promise<void> {
    if (!this.pendingYield && performance.now() - this.sliceStart < SLICE_DURATION) {
      return;
    }

    this.pendingYield ??= yieldToMain().then(() => {
      this.sliceStart = performance.now();
      this.pendingYield = null;
    });

    await this.pendingYield;
  }
  // Stryker restore all

  /**
   * @description
   * Publishes the working state at most every `PUBLISH_INTERVAL`, so a burst of cached lookups renders once
   * rather than once per lookup.
   */
  private schedulePublish(): void {
    this.publishTimer ??= setTimeout(() => {
      this.publishTimer = null;
      this.publish();
    }, PUBLISH_INTERVAL);
  }

  private cancelPublish(): void {
    if (this.publishTimer) {
      clearTimeout(this.publishTimer);
      this.publishTimer = null;
    }
  }

  private publish(): void {
    // Stryker disable next-line CallExpression: a leftover timer would only publish the same state again.
    this.cancelPublish();

    const items = new Map(this.items);
    const { done, failed } = this.progress;

    this.store.setState(state => ({ ...state, items, done, failed }));
  }
}
