/**
 * Twitch Token Manager
 * Automatically handles Twitch App Access Token generation, caching, and refresh
 */

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CachedToken {
  access_token: string;
  expires_at: number; // Unix timestamp
  token_type: string;
}

class TwitchTokenManager {
  private static instance: TwitchTokenManager;
  private cachedToken: CachedToken | null = null;
  private tokenPromise: Promise<string> | null = null;

  private constructor() {}

  public static getInstance(): TwitchTokenManager {
    if (!TwitchTokenManager.instance) {
      TwitchTokenManager.instance = new TwitchTokenManager();
    }
    return TwitchTokenManager.instance;
  }

  /**
   * Get a valid access token, requesting a new one if needed
   */
  public async getAccessToken(): Promise<string> {
    // If we already have a request in progress, wait for it
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Check if we have a valid cached token
    if (this.isTokenValid()) {
      return this.cachedToken!.access_token;
    }

    // Request a new token
    this.tokenPromise = this.requestNewToken();
    
    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  /**
   * Check if the current cached token is still valid
   */
  private isTokenValid(): boolean {
    if (!this.cachedToken) {
      return false;
    }

    // Add a 5-minute buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    
    return this.cachedToken.expires_at > now + bufferTime;
  }

  /**
   * Request a new token from Twitch
   */
  private async requestNewToken(): Promise<string> {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables are required');
    }

    console.log('🔄 Requesting new Twitch App Access Token...');

    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Twitch token: ${response.status} ${errorText}`);
      }

      const tokenData: TwitchTokenResponse = await response.json();

      // Cache the token with expiration time
      this.cachedToken = {
        access_token: tokenData.access_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000), // Convert to milliseconds
        token_type: tokenData.token_type,
      };

      console.log(`✅ New Twitch token acquired, expires in ${Math.floor(tokenData.expires_in / 3600)} hours`);

      return tokenData.access_token;

    } catch (error) {
      console.error('❌ Failed to get Twitch token:', error);
      throw new Error(`Failed to authenticate with Twitch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a token with Twitch (optional, for debugging)
   */
  public async validateToken(token?: string): Promise<boolean> {
    const tokenToValidate = token || this.cachedToken?.access_token;
    
    if (!tokenToValidate) {
      return false;
    }

    try {
      const response = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Clear the cached token (useful for testing or forcing refresh)
   */
  public clearCache(): void {
    this.cachedToken = null;
    this.tokenPromise = null;
  }

  /**
   * Get token info for debugging
   */
  public getTokenInfo(): { hasToken: boolean; expiresAt?: Date; isValid?: boolean } {
    if (!this.cachedToken) {
      return { hasToken: false };
    }

    return {
      hasToken: true,
      expiresAt: new Date(this.cachedToken.expires_at),
      isValid: this.isTokenValid(),
    };
  }
}

// Export singleton instance
export const twitchTokenManager = TwitchTokenManager.getInstance(); 