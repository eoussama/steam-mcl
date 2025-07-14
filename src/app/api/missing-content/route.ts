import { NextRequest, NextResponse } from "next/server";
import { getOwnedGames, analyzeMissingContent } from "@/lib/helpers";



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json(
      { error: "Steam ID parameter is required" },
      { status: 400 }
    );
  }

  try {
    const ownedGames = await getOwnedGames(steamId, true);
    
    if (!ownedGames || ownedGames.length === 0) {
      return NextResponse.json({
        missingContent: [],
        message: "No owned games found for this Steam profile"
      });
    }

    const validOwnedGames = ownedGames.filter(game => game.name && game.name.trim().length > 0);

    if (validOwnedGames.length === 0) {
      return NextResponse.json({
        missingContent: [],
        message: "No valid game names found in Steam library"
      });
    }

    const missingContent = await analyzeMissingContent(validOwnedGames);

    return NextResponse.json({
      missingContent,
      analyzedGames: validOwnedGames.length,
      totalOwnedGames: ownedGames.length
    });
  } catch (error) {
    console.error("Error analyzing missing content:", error);
    
    return NextResponse.json(
      { error: "Failed to analyze missing content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { steamId } = body;

    if (!steamId) {
      return NextResponse.json(
        { error: "steamId is required" },
        { status: 400 }
      );
    }

    const ownedGames = await getOwnedGames(steamId, true);
    
    if (!ownedGames || ownedGames.length === 0) {
      return NextResponse.json({
        missingContent: [],
        message: "No owned games found for this Steam profile"
      });
    }

    const validOwnedGames = ownedGames.filter(game => game.name && game.name.trim().length > 0);

    if (validOwnedGames.length === 0) {
      return NextResponse.json({
        missingContent: [],
        message: "No valid game names found in Steam library"
      });
    }

    const missingContent = await analyzeMissingContent(validOwnedGames);

    return NextResponse.json({
      missingContent,
      analyzedGames: validOwnedGames.length
    });
  } catch (error) {
    console.error("Error analyzing missing content:", error);
    
    return NextResponse.json(
      { error: "Failed to analyze missing content" },
      { status: 500 }
    );
  }
} 