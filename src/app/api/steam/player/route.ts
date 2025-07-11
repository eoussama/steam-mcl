import { NextRequest, NextResponse } from 'next/server';
import { getPlayerSummaries, getOwnedGames, resolveVanityURL, extractSteamId } from '../../../lib/steam-api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');

  if (!input) {
    return NextResponse.json(
      { error: 'Input parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Extract potential Steam ID from input
    const extractedId = extractSteamId(input);
    const isDirectSteamId = extractedId && /^\d{17}$/.test(extractedId);
    
    let steamId: string;
    
    if (isDirectSteamId) {
      steamId = extractedId;
    } else {
      // Resolve vanity URL
      const resolvedId = await resolveVanityURL(extractedId || input);
      if (!resolvedId) {
        return NextResponse.json(
          { error: 'Could not resolve Steam profile' },
          { status: 404 }
        );
      }
      steamId = resolvedId;
    }

    // Get player data and owned games
    const [players, ownedGames] = await Promise.all([
      getPlayerSummaries([steamId]),
      getOwnedGames(steamId, true),
    ]);

    const player = players[0];
    if (!player) {
      return NextResponse.json(
        { error: 'Steam profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      player,
      ownedGames,
      steamId,
    });
  } catch (error) {
    console.error('Error fetching Steam player data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Steam player data' },
      { status: 500 }
    );
  }
} 