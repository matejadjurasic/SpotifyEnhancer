import * as AuthSession from 'expo-auth-session';
import { SPOTIFY_AUTH_CONFIG, SPOTIFY_CLIENT_ID, STORAGE_KEYS } from '../config/constants';
import { secureStorage } from '../utils/storage';

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'spotifyenhancer',
  path: 'callback',
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
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    };
  },

  async saveToken(token: string): Promise<boolean> {
    return await secureStorage.save(STORAGE_KEYS.SPOTIFY_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await secureStorage.get(STORAGE_KEYS.SPOTIFY_TOKEN);
  },

  async clearToken(): Promise<boolean> {
    return await secureStorage.remove(STORAGE_KEYS.SPOTIFY_TOKEN);
  },
};