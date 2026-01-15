import { Audio } from 'expo-av';

export interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface UploadResponse {
  track: string;
  artist: string;
  photoUrl?: string | null;
}

export interface AuthHookReturn {
  isAuthenticated: boolean;
  spotifyToken: string | null;
  isLoading: boolean;
  canLogin: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

export interface RecordingHookReturn {
  isRecording: boolean;
  isUploading: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  result: UploadResponse | null;
  showConfirm: boolean;
  setShowConfirm: (value: boolean) => void;
}

export type Recording = Audio.Recording;

export interface SpotifyAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}