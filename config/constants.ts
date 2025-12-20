import Constants from 'expo-constants';

export const SPOTIFY_CLIENT_ID = Constants.expoConfig?.extra?.spotifyClientId || 
  process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;

export const N8N_WEBHOOK_URL = Constants.expoConfig?.extra?.n8nWebhookUrl || 
  process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;

export const SPOTIFY_AUTH_CONFIG = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  scopes: ['user-read-email', 'user-read-private', 'user-top-read'],
};

export const RECORDING_CONFIG = {
  MAX_DURATION_SECONDS: 30,
  AUDIO_MODE: {
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  },
};

export const STORAGE_KEYS = {
  SPOTIFY_TOKEN: 'spotify_token',
};