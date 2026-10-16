import { createFileRoute, useLocation } from "@tanstack/react-router";
import { Disc3, HardDriveDownload, Layers } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ProfileSearchForm } from "@/features/search/ProfileSearchForm";



export const Route = createFileRoute("/")({
  component: Home,
});

const HIGHLIGHTS = [
  { icon: Disc3, title: "DLC & soundtracks", text: "Every add-on and OST for the games you own." },
  { icon: Layers, title: "Franchises & editions", text: "Sequels, spin-offs, remasters and studio picks." },
  { icon: HardDriveDownload, title: "Cached locally", text: "Results stay on your device, revisits are instant." },
] as const;

function Home() {
  // "New search" asks for the field to be ready to type in.
  const focusSearch = useLocation({ select: location => Boolean(location.state.focusSearch) });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-10 sm:py-16">
      <section className="relative animate-rise">
        <img
          src="/logo.png"
          alt=""
          className="pointer-events-none absolute -top-6 right-0 size-28 opacity-25 drop-shadow-2xl animate-float sm:size-40 md:size-52 dark:opacity-60"
        />

        <h1 className="relative space-y-2">
          <span className="block font-heading text-6xl font-black leading-none tracking-tight steam-title [view-transition-name:brand-title] sm:text-7xl md:text-8xl">
            Steam
          </span>
          <span className="block text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Missing Content Lookup
          </span>
        </h1>

        <p className="relative mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Find the DLC, soundtracks, editions and franchise games missing from your Steam library.
        </p>
      </section>

      <Card className="glass animate-rise rounded-2xl shadow-xl shadow-steam-navy/5 [animation-delay:80ms] [view-transition-name:search-card] dark:shadow-black/30">
        <CardContent>
          <ProfileSearchForm autoFocus={focusSearch} />
        </CardContent>
      </Card>

      <ul className="grid animate-rise gap-3 [animation-delay:160ms] sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
            <Icon className="mt-0.5 size-5 shrink-0 text-steam-blue" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
