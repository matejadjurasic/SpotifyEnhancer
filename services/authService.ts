import {
    SPOTIFY_AUTH_CONFIG,
    SPOTIFY_CLIENT_ID,
    STORAGE_KEYS,
} from "@/config/constants";
import { SpotifyAuthTokens } from "@/types";
import { secureStorage } from "@/utils/storage";
import * as AuthSession from "expo-auth-session";

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "spotifyenhancer",
  path: "callback",
});

export const authService = {
  getAuthRequest(): AuthSession.AuthRequestConfig {
    return {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_AUTH_CONFIG.scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    };
  },

  getDiscovery(): AuthSession.DiscoveryDocument {
    return {
      authorizationEndpoint: SPOTIFY_AUTH_CONFIG.authorizationEndpoint,
      tokenEndpoint: "https://accounts.spotify.com/api/token",
    };
  },

  async saveTokens(tokens: SpotifyAuthTokens): Promise<boolean> {
    await secureStorage.save(STORAGE_KEYS.SPOTIFY_TOKEN, tokens.accessToken);
    await secureStorage.save(
      STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
      tokens.refreshToken,
    );
    await secureStorage.save(
      STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRES_AT,
      tokens.expiresAt.toString(),
    );
    return true;
  },

  async refreshToken(refreshToken: string) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: SPOTIFY_CLIENT_ID,
      }).toString(),
    });

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? refreshToken, // Spotify may not resend it
    };
  },

  async getToken(): Promise<string | null> {
    return await secureStorage.get(STORAGE_KEYS.SPOTIFY_TOKEN);
  },

  async getTokens(): Promise<SpotifyAuthTokens | null> {
    const accessToken = await secureStorage.get(STORAGE_KEYS.SPOTIFY_TOKEN);
    const refreshToken = await secureStorage.get(
      STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
    );
    const expiresAtStr = await secureStorage.get(
      STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRES_AT,
    );

    if (!accessToken || !refreshToken || !expiresAtStr) return null;

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAtStr, 10),
    };
  },

  async clearToken(): Promise<boolean> {
    await secureStorage.remove(STORAGE_KEYS.SPOTIFY_TOKEN);
    await secureStorage.remove(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN);
    await secureStorage.remove(STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRES_AT);
    return true;
  },
  async getValidAccessToken(): Promise<string | null> {
    const tokens = await this.getTokens();

    if (!tokens) return null;

    if (Date.now() < tokens.expiresAt - 60_000) {
      return tokens.accessToken;
    }

    const refreshed = await this.refreshToken(tokens.refreshToken);
    await this.saveTokens(refreshed);

    return refreshed.accessToken;
  },
};
