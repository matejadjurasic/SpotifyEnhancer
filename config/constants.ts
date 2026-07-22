import { Audio } from "expo-av";
import Constants from "expo-constants";

export const SPOTIFY_CLIENT_ID =
  Constants.expoConfig?.extra?.spotifyClientId ||
  process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;

export const N8N_WEBHOOK_URL =
  Constants.expoConfig?.extra?.n8nWebhookUrl ||
  process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;

export const N8N_TRANSCRIBE_WEBHOOK_URL =
  Constants.expoConfig?.extra?.n8nTranscribeWebhookUrl ||
  process.env.EXPO_PUBLIC_N8N_TRANSCRIBE_WEBHOOK_URL;

export const N8N_NEARBY_ARTISTS_WEBHOOK_URL =
  Constants.expoConfig?.extra?.n8nNearbyArtistsWebhookUrl ||
  process.env.EXPO_PUBLIC_N8N_NEARBY_ARTISTS_WEBHOOK_URL;

export const N8N_CITY_MARKERS_WEBHOOK_URL =
  Constants.expoConfig?.extra?.n8nCityMarkersWebhookUrl ||
  process.env.EXPO_PUBLIC_N8N_CITY_MARKERS_WEBHOOK_URL;

export const N8N_ARTISTS_BY_CITY_WEBHOOK_URL =
  Constants.expoConfig?.extra?.n8nArtistsByCityWebhookUrl ||
  process.env.EXPO_PUBLIC_N8N_ARTISTS_BY_CITY_WEBHOOK_URL;

export const DEEPGRAM_API_KEY =
  Constants.expoConfig?.extra?.deepgramApiKey ||
  process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY ||
  "";

export const DEEPGRAM_WS_URL =
  "wss://api.deepgram.com/v1/listen" +
  "?model=nova-3&language=en&encoding=linear16" +
  "&sample_rate=16000&channels=1&interim_results=true";

export const SPOTIFY_AUTH_CONFIG = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  scopes: [
    "user-read-email",
    "user-read-private",
    "user-top-read",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-library-read",
    "user-library-modify",
    "streaming",
    "playlist-modify-private",
    "playlist-modify-public",
    "playlist-read-private",
    "playlist-read-collaborative",
  ],
};

export const RECORDING_CONFIG = {
  MAX_DURATION_SECONDS: 30,
  AUDIO_MODE: {
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  },
};

export const STORAGE_KEYS = {
  SPOTIFY_TOKEN: "spotify_token",
  SPOTIFY_REFRESH_TOKEN: "spotify_refresh_token",
  SPOTIFY_TOKEN_EXPIRES_AT: "spotify_token_expires_at",
};

export const WHISPER_RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: ".wav",
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: ".wav",
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {},
};
