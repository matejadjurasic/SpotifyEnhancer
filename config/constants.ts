import { Audio } from "expo-av";
import Constants from "expo-constants";

export const SPOTIFY_CLIENT_ID =
  Constants.expoConfig?.extra?.spotifyClientId ||
  process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;

export const N8N_WEBHOOK_URL =
  Constants.expoConfig?.extra?.n8nWebhookUrl ||
  process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;

export const SPOTIFY_AUTH_CONFIG = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  scopes: [
    "user-read-email",
    "user-read-private",
    "user-top-read",
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming",
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
