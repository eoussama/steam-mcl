import { createFileRoute } from "@tanstack/react-router";

import { analyzeMissingContent, getOwnedGames } from "@/server/steam/legacy";



export const Route = createFileRoute("/api/missing-content")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const steamId = new URL(request.url).searchParams.get("steamId");

        if (!steamId) {
          return Response.json({ error: "Steam ID parameter is required" }, { status: 400 });
        }

        try {
          const ownedGames = await getOwnedGames(steamId, true);

          if (ownedGames.length === 0) {
            return Response.json({ missingContent: [], message: "No owned games found for this Steam profile" });
          }

          const validOwnedGames = ownedGames.filter(game => game.name && game.name.trim().length > 0);

          if (validOwnedGames.length === 0) {
            return Response.json({ missingContent: [], message: "No valid game names found in Steam library" });
          }

          const missingContent = await analyzeMissingContent(validOwnedGames);

          return Response.json({
            missingContent,
            analyzedGames: validOwnedGames.length,
            totalOwnedGames: ownedGames.length,
          });
        }
        catch (error) {
          console.error("Error analyzing missing content:", error);

          return Response.json({ error: "Failed to analyze missing content" }, { status: 500 });
        }
      },
    },
  },
});
