import { createDeepgramTranscriptionProvider } from "@/services/deepgramTranscriptionProvider";
import type {
  TranscriptionHook,
  TranscriptionProvider,
  TranscriptionProviderFactory,
} from "@/types";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import AudioRecord from "react-native-audio-record";

const AUDIO_INIT_OPTIONS = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 6,
  wavFile: "transcription_stream.wav",
} as const;

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 1000;
const MAX_PENDING_CHUNKS = 100;
const MAX_TRANSCRIPT_CHARS = 8000;

export const useDeepgramTranscription = (
  createProvider: TranscriptionProviderFactory = createDeepgramTranscriptionProvider,
  options?: { onAutoSend?: (transcript: string) => void },
): TranscriptionHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const providerRef = useRef<TranscriptionProvider | null>(null);
  const finalTranscriptRef = useRef("");
  const isRecordingRef = useRef(false);
  const unmountedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isReconnectingRef = useRef(false);
  const pendingChunksRef = useRef<string[]>([]);
  const connectProviderRef = useRef<((isReconnect: boolean) => void) | null>(
    null,
  );
  const stopTranscriptionRef = useRef<(() => Promise<string>) | null>(null);
  const onAutoSendRef = useRef(options?.onAutoSend);
  const audioDataSubscriptionRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    onAutoSendRef.current = options?.onAutoSend;
  }, [options?.onAutoSend]);

  const connectProvider = useCallback(
    (isReconnect: boolean) => {
      if (unmountedRef.current) return;

      const provider = createProvider();
      providerRef.current = provider;
      let hasConnected = false;

      provider.connect({
        onConnected: () => {
          hasConnected = true;
          if (unmountedRef.current) {
            provider.close();
            return;
          }

          isReconnectingRef.current = false;
          reconnectAttemptsRef.current = 0;
          setIsConnecting(false);

          if (isReconnect) {
            const pending = pendingChunksRef.current.splice(0);
            for (const chunk of pending) {
              provider.sendChunk(chunk);
            }
          } else {
            audioDataSubscriptionRef.current?.remove();
            AudioRecord.init(AUDIO_INIT_OPTIONS);
            audioDataSubscriptionRef.current = AudioRecord.on(
              "data",
              (data: string) => {
                if (isReconnectingRef.current) {
                  if (pendingChunksRef.current.length < MAX_PENDING_CHUNKS) {
                    pendingChunksRef.current.push(data);
                  }
                  return;
                }
                providerRef.current?.sendChunk(data);
              },
            ) as unknown as { remove: () => void };
            AudioRecord.start();
          }

          isRecordingRef.current = true;
          setIsRecording(true);
        },

        onFinalTranscript: (transcript) => {
          setInterimTranscript("");
          if (!transcript) return;
          const next = finalTranscriptRef.current
            ? `${finalTranscriptRef.current} ${transcript}`
            : transcript;
          const trimmed =
            next.length > MAX_TRANSCRIPT_CHARS
              ? next.slice(next.length - MAX_TRANSCRIPT_CHARS)
              : next;
          finalTranscriptRef.current = trimmed;
          setFinalTranscript(trimmed);
        },

        onInterimTranscript: (transcript) => {
          setInterimTranscript(transcript);
        },

        onDisconnected: () => {
          providerRef.current = null;

          if (!isRecordingRef.current) {
            setIsRecording(false);
            setIsConnecting(false);
            if (!hasConnected && !isReconnect && !unmountedRef.current) {
              setError(
                "Could not connect to the transcription service. Check your API key and internet connection.",
              );
            }
            return;
          }

          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            isReconnectingRef.current = true;
            const delay =
              RECONNECT_BASE_DELAY_MS * 2 ** (reconnectAttemptsRef.current - 1);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              if (!unmountedRef.current && isRecordingRef.current) {
                connectProviderRef.current?.(true);
              }
            }, delay);
          } else {
            isReconnectingRef.current = false;
            isRecordingRef.current = false;
            reconnectAttemptsRef.current = 0;
            if (!unmountedRef.current) {
              setIsRecording(false);
              setInterimTranscript("");
              setError(
                "Could not reconnect to the transcription service. Recording has stopped.",
              );
            }
          }
        },

        onError: (message) => {
          providerRef.current = null;
          setError(message);
        },

        onSpeechFinal: (_transcript) => {
          if (!isRecordingRef.current) return;
          stopTranscriptionRef.current?.().then((accumulated) => {
            if (accumulated) {
              onAutoSendRef.current?.(accumulated);
            }
          });
        },
      });
    },
    [createProvider],
  );

  useEffect(() => {
    connectProviderRef.current = connectProvider;
  }, [connectProvider]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "background" || !isRecordingRef.current) return;
      if (Platform.OS === "android") {
        stopTranscriptionRef.current?.();
        setError("Recording stopped — app moved to background.");
      }
    });
    return () => subscription.remove();
  }, []);

  const startTranscription = useCallback(async () => {
    if (isRecordingRef.current || providerRef.current !== null) {
      console.warn(
        "[useTranscription] startTranscription called while already active",
      );
      return;
    }

    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      setError("Please enable microphone access.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    setIsConnecting(true);
    connectProvider(false);
  }, [connectProvider]);

  const stopTranscription = useCallback(async (): Promise<string> => {
    isRecordingRef.current = false;
    isReconnectingRef.current = false;
    pendingChunksRef.current = [];
    reconnectAttemptsRef.current = 0;
    setIsConnecting(false);

    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    await AudioRecord.stop();
    audioDataSubscriptionRef.current?.remove();
    audioDataSubscriptionRef.current = null;
    setIsRecording(false);
    setInterimTranscript("");

    if (providerRef.current) {
      await providerRef.current.close();
    }

    return finalTranscriptRef.current;
  }, []);

  useEffect(() => {
    stopTranscriptionRef.current = stopTranscription;
  }, [stopTranscription]);

  const clearTranscript = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      isRecordingRef.current = false;
      audioDataSubscriptionRef.current?.remove();
      audioDataSubscriptionRef.current = null;
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      providerRef.current?.close();
      providerRef.current = null;
    };
  }, []);

  return {
    isRecording,
    isConnecting,
    finalTranscript,
    interimTranscript,
    startTranscription,
    stopTranscription,
    clearTranscript,
    error,
    clearError,
  };
};
