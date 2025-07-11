import { NextRequest, NextResponse } from 'next/server';
import { analyzeMissingContent } from '../../lib/igdb-api';
import { getOwnedGames } from '../../lib/steam-api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get('steamId');

  if (!steamId) {
    return NextResponse.json(
      { error: 'Steam ID parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Get owned games from Steam
    const ownedGames = await getOwnedGames(steamId, true);
    
    if (!ownedGames || ownedGames.length === 0) {
      return NextResponse.json({
        missingContent: [],
        message: 'No owned games found for this Steam profile'
      });
    }

    // Extract game names (filter out games without names)
    const gameNames = ownedGames
      .filter(game => game.name && game.name.trim().length > 0)
      .map(game => game.name!)
      .slice(0, 20); // Limit to first 20 games to avoid long processing times

    if (gameNames.length === 0) {
      return NextResponse.json({
        missingContent: [],
        message: 'No valid game names found in Steam library'
      });
    }

    // Analyze missing content using IGDB
    const missingContent = await analyzeMissingContent(gameNames);

    return NextResponse.json({
      missingContent,
      analyzedGames: gameNames.length,
      totalOwnedGames: ownedGames.length
    });
  } catch (error) {
    console.error('Error analyzing missing content:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('TWITCH_CLIENT_ID')) {
      return NextResponse.json(
        { error: 'IGDB API credentials not configured. Please set TWITCH_CLIENT_ID and TWITCH_APP_ACCESS_TOKEN environment variables.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze missing content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameNames } = body;

    if (!gameNames || !Array.isArray(gameNames)) {
      return NextResponse.json(
        { error: 'gameNames array is required' },
        { status: 400 }
      );
    }

    if (gameNames.length === 0) {
      return NextResponse.json({
        missingContent: [],
        message: 'No game names provided'
      });
    }

    // Limit the number of games to analyze
    const limitedGameNames = gameNames.slice(0, 30);

    // Analyze missing content using IGDB
    const missingContent = await analyzeMissingContent(limitedGameNames);

    return NextResponse.json({
      missingContent,
      analyzedGames: limitedGameNames.length
    });
  } catch (error) {
    console.error('Error analyzing missing content:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('TWITCH_CLIENT_ID')) {
      return NextResponse.json(
        { error: 'IGDB API credentials not configured. Please set TWITCH_CLIENT_ID and TWITCH_APP_ACCESS_TOKEN environment variables.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze missing content' },
      { status: 500 }
    );
  }
} 