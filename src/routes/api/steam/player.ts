import { createFileRoute } from "@tanstack/react-router";

import { extractSteamId, getOwnedGames, getPlayerSummaries, resolveVanityURL } from "@/server/steam/legacy";



export const Route = createFileRoute("/api/steam/player")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const input = new URL(request.url).searchParams.get("input");

        if (!input) {
          return Response.json({ error: "Input parameter is required" }, { status: 400 });
        }

        try {
          const extractedId = extractSteamId(input);
          const isDirectSteamId = extractedId && /^\d{17}$/.test(extractedId);

          let steamId: string;

          if (isDirectSteamId) {
            steamId = extractedId;
          }
          else {
            const resolvedId = await resolveVanityURL(extractedId || input);

            if (!resolvedId) {
              return Response.json({ error: "Could not resolve Steam profile" }, { status: 404 });
            }

            steamId = resolvedId;
          }

          const [players, ownedGames] = await Promise.all([
            getPlayerSummaries([steamId]),
            getOwnedGames(steamId, true),
          ]);

          const player = players[0];

          if (!player) {
            return Response.json({ error: "Steam profile not found" }, { status: 404 });
          }

          return Response.json({ player, ownedGames, steamId });
        }
        catch (error) {
          console.error("Error fetching Steam player data:", error);

          return Response.json({ error: "Failed to fetch Steam player data" }, { status: 500 });
        }
      },
    },
  },
});
