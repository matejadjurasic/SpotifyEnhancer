import { Audio } from "expo-av";

export interface TranscriptionCallbacks {
  onFinalTranscript: (transcript: string) => void;
  onInterimTranscript: (transcript: string) => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (message: string) => void;
  onSpeechFinal: (transcript: string) => void;
}

export interface TranscriptionProvider {
  connect(callbacks: TranscriptionCallbacks): void;
  sendChunk(chunk: string): void;
  close(): Promise<void>;
}

export type TranscriptionProviderFactory = () => TranscriptionProvider;

export interface TranscriptionHook {
  isRecording: boolean;
  isConnecting: boolean;
  finalTranscript: string;
  interimTranscript: string;
  startTranscription: () => Promise<void>;
  stopTranscription: () => Promise<string>;
  clearTranscript: () => void;
  error: string | null;
  clearError: () => void;
}

export interface UploadResponse {
  track: string;
  artist: string;
  photoUrl?: string | null;
}

export interface NearbyArtist {
  name: string;
  genres?: string[];
  imageUrl?: string | null;
  popularity?: number;
  spotifyUrl?: string | null;
}

export interface NearbyArtistsResponse {
  artists: NearbyArtist[];
  location?: string;
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
