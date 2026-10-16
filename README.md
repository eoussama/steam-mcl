<p align=center>
   <img width=200 alt="Steam MCL logo" src="public/logo-large.png">
</p>
<h1 align=center>Steam Missing Content Lookup</h1>

<p align=center>
Find the DLC, soundtracks, editions and franchise games missing from your Steam library.
</p>

---

## What it finds

Enter a Steam profile and the app lists everything related to its games that it does not own:

| Category | What it is |
|---|---|
| **DLC** | Add-ons of games in the library |
| **Soundtracks** | Official soundtracks of those games |
| **Editions** | Other editions, such as a Definitive or Game of the Year edition |
| **Franchise** | Other games of the same franchise |
| **Studios** | Other games by the developers of your most played games |

Results are ordered by how much you play the game they relate to. They can be filtered by category and name, sorted
by price or release date, and grouped by game. Filters live in the URL, so a view can be shared.

Steam only shares the *games* of a profile publicly, so DLC and soundtracks you already own show up as missing. To fix
that, use **Import what you own** in the profile menu. It reads your Steam store data
(`store.steampowered.com/dynamicstore/userdata/`) when you paste it in. The import also brings in:

- your **wishlist**: wishlisted items get a badge and their own filter
- the apps you **ignore on Steam**, which are hidden

Any item can also be marked owned or hidden by hand.

## How it works

- **Profile and library** come from the Steam Web API through the server, which keeps the API key private.
- **Related content** comes from public Steam store endpoints: DLC lists, store search by franchise and developer,
  and item details in batches.
- **The analysis runs in your browser.** Lookups are queued by playtime, so results appear within seconds and fill in
  as the scan goes on. When Steam rate limits, the queue pauses and resumes on its own.
- **Everything is cached:**
  - on your device in IndexedDB for up to 7 days
  - on the Vercel CDN, shared by all visitors, for 1 day

  A first scan of a large library takes a few minutes, revisits are instant.
- **Your marks and imports** stay in your browser's local storage and sync across tabs. They are never uploaded.

## Stack

- [TanStack Start](https://tanstack.com/start) with Router, Query, Form, Virtual, Pacer, Store and DB, on Vite and Nitro
- [tRPC](https://trpc.io) for the API, with Zod validation
- [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), Tailwind CSS v4
- [@eoussama/core](https://www.npmjs.com/package/@eoussama/core) utilities and
  [@eoussama/dx](https://www.npmjs.com/package/@eoussama/dx) linting
- Vitest

## Getting started

### Prerequisites

- Node.js 22.18+ or 24+
- [pnpm](https://pnpm.io) 12
- A [Steam Web API key](https://steamcommunity.com/dev/apikey)

### Setup

```bash
git clone https://github.com/eoussama/steam-mcl.git
cd steam-mcl
pnpm install
cp .env.example .env   # then set STEAM_KEY
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Does |
|---|---|
| `pnpm dev` | Starts the dev server on port 3000 |
| `pnpm build` | Builds for production |
| `pnpm start` | Serves the production build, reading `.env` |
| `pnpm lint` / `pnpm lint:fix` | Lints, or lints and fixes |
| `pnpm typecheck` | Type checks |
| `pnpm test` | Runs the unit tests |
| `pnpm test:e2e` | Builds, then runs the end-to-end tests in Edge |
| `pnpm test:mutation` | Runs mutation testing on the core logic |

### Testing

- **Unit tests** (Vitest) cover the analysis engine, classification, result selection, parsers and the Steam
  clients.
- **End-to-end tests** (Playwright) run against the production build:
  - Steam is mocked at the network level, so they need no API key and never hit rate limits.
  - They run in the installed Microsoft Edge by default; set `PLAYWRIGHT_CHANNEL` to use another browser, for example
    `chrome`.
- **Mutation tests** (Stryker) change the core logic in small ways and check that a unit test fails each time:
  - The HTML report is written to `reports/mutation/index.html`.
  - They use Stryker's command runner, because its Vitest runner cannot activate mutants on Vitest 5 yet.

## Environment

| Variable | Required | Description |
|---|---|---|
| `STEAM_KEY` | Yes | Steam Web API key, 32 hexadecimal characters. Server side only, never sent to the browser. |

## Deploying to Vercel

1. Import the repository in Vercel.
2. In **Settings → Build and Deployment**, set **Framework Preset** to **TanStack Start**, or **Other** if it is not
   listed. A project created back when this was a Next.js app still has the Next.js preset, which fails to build.
3. Under **Settings → Environment Variables**, add:
   - `STEAM_KEY`, marked **Sensitive**
   - `ENABLE_EXPERIMENTAL_COREPACK` set to `1`, so Vercel builds with the pnpm version pinned in `package.json`
4. Deploy. Nitro detects Vercel and outputs a ready to serve build, no `vercel.json` needed.

Store lookups are served with `s-maxage`, so the Vercel CDN answers repeated lookups for every visitor without
calling Steam.

## Privacy

- The server only calls Steam and keeps nothing.
- Pasted store data is read in your browser, and only app IDs are kept, in local storage.
- Security headers include a nonce based Content Security Policy.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License, see the [LICENSE](LICENSE) file for details.

---

> **Note**: This application is not affiliated with or endorsed by Valve Corporation or Steam.
