import { DEEPGRAM_API_KEY, DEEPGRAM_WS_URL } from "@/config/constants";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, Platform } from "react-native";
import AudioRecord from "react-native-audio-record";

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const AUDIO_INIT_OPTIONS = {
  sampleRate: 16000, // 16 kHz — standard sample rate for ASR models
  channels: 1, // Mono — sufficient for speech; halves bandwidth vs stereo
  bitsPerSample: 16, // 16-bit PCM — matches Deepgram's linear16 encoding param
  audioSource: 6, // MediaRecorder.AudioSource.MIC on Android
  wavFile: "dg_stream.wav",
} as const;

/** Maximum number of automatic reconnect attempts before giving up. */
const MAX_RECONNECT_ATTEMPTS = 3;
/** Base delay for exponential back-off. Attempt N waits BASE × 2^(N-1) ms. */
const RECONNECT_BASE_DELAY_MS = 1000;
/** How long to wait for Deepgram to flush buffered audio before force-closing. */
const FLUSH_TIMEOUT_MS = 3000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeepgramTranscriptionHook {
  isRecording: boolean;
  finalTranscript: string;
  interimTranscript: string;
  startTranscription: () => Promise<void>;
  stopTranscription: () => Promise<string>;
  clearTranscript: () => void;
}

interface DeepgramResultMessage {
  type: string;
  is_final: boolean;
  speech_final: boolean;
  channel?: { alternatives?: Array<{ transcript: string }> };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a Base64 PCM string (emitted by AudioRecord) into an ArrayBuffer
 * for transmission over the Deepgram WebSocket.
 *
 * Performance note: atob + Uint8Array copy is O(n) per chunk. At 16 kHz /
 * 16-bit mono, typical chunk sizes are 2–8 KB — negligible on modern devices.
 * If profiling ever identifies this as a bottleneck, replace with a native
 * bridge call that avoids the JS-side copy entirely.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useDeepgramTranscription = (): DeepgramTranscriptionHook => {
  // Reactive state — drives UI re-renders
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  // Imperative refs — always hold the latest value; safe to read in callbacks
  // without being affected by React's async state batching.
  const wsRef = useRef<WebSocket | null>(null);
  const finalTranscriptRef = useRef("");
  // Mirrors isRecording so event handlers can read the current intent
  // synchronously even before React flushes the corresponding setState.
  const isRecordingRef = useRef(false);

  // Reconnection state
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pendingChunksRef = useRef<string[]>([]);
  const isReconnectingRef = useRef(false);

  // Guards setState calls after the component has unmounted.
  const unmountedRef = useRef(false);

  // Stable ref to connectWebSocket so the onclose handler can schedule a
  // recursive reconnect without forming a stale closure over the function.
  const connectWebSocketRef = useRef<((isReconnect: boolean) => void) | null>(
    null,
  );

  // -------------------------------------------------------------------------
  // WebSocket factory
  // -------------------------------------------------------------------------

  const connectWebSocket = useCallback((isReconnect: boolean) => {
    if (unmountedRef.current) return;

    // React Native's WebSocket runtime accepts a third options argument for
    // custom headers. The browser TS spec does not include it, so we cast
    // through unknown to extend the constructor signature.
    // The API key is passed as a header rather than a URL query parameter to
    // avoid exposure in proxy access logs and device request histories.
    const RNWebSocket = WebSocket as unknown as new (
      url: string,
      protocols: string[],
      options: { headers: Record<string, string> },
    ) => WebSocket;

    const ws = new RNWebSocket(DEEPGRAM_WS_URL, [], {
      headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` },
    });

    ws.onopen = () => {
      if (unmountedRef.current) {
        ws.close();
        return;
      }

      isReconnectingRef.current = false;
      reconnectAttemptsRef.current = 0;
      console.log(
        isReconnect
          ? "[Deepgram] Reconnected successfully"
          : "[Deepgram] WebSocket opened",
      );

      if (isReconnect) {
        // Flush audio chunks buffered during the reconnect window so that
        // speech captured while offline is still sent for transcription.
        const pending = pendingChunksRef.current.splice(0);
        for (const chunk of pending) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(base64ToArrayBuffer(chunk));
          }
        }
        console.log(`[Deepgram] Flushed ${pending.length} buffered chunk(s)`);
      } else {
        // First connection — start the audio pipeline. The data handler reads
        // wsRef.current so it automatically targets the active (or reconnected)
        // socket without needing re-registration after a reconnect.
        let chunkCount = 0;
        AudioRecord.init(AUDIO_INIT_OPTIONS);
        AudioRecord.on("data", (data: string) => {
          chunkCount++;
          if (chunkCount % 20 === 0) {
            console.log(
              "[Deepgram] Chunks sent:",
              chunkCount,
              "| chunk size:",
              data.length,
            );
          }
          if (isReconnectingRef.current) {
            // Socket is being re-established — buffer the chunk so it can be
            // flushed once the new connection is open.
            pendingChunksRef.current.push(data);
            return;
          }
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(base64ToArrayBuffer(data));
          }
        });
        AudioRecord.start();
        console.log("[Deepgram] AudioRecord started");
      }

      isRecordingRef.current = true;
      setIsRecording(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as DeepgramResultMessage;
        if (msg.type !== "Results") return;

        const transcript = msg.channel?.alternatives?.[0]?.transcript;
        console.log(
          "[Deepgram] Result | is_final:",
          msg.is_final,
          "| transcript:",
          JSON.stringify(transcript),
        );

        if (msg.is_final) {
          setInterimTranscript("");
          if (!transcript) return;
          // Update ref synchronously so stopTranscription always reads the
          // latest value even before React flushes the corresponding setState.
          const next = finalTranscriptRef.current
            ? `${finalTranscriptRef.current} ${transcript}`
            : transcript;
          finalTranscriptRef.current = next;
          setFinalTranscript(next);
        } else {
          setInterimTranscript(transcript ?? "");
        }
      } catch (e) {
        console.warn("[Deepgram] Failed to parse message:", event.data, e);
      }
    };

    // On React Native, onerror is always followed by onclose. We log here and
    // let onclose drive the reconnect decision to avoid double-handling.
    ws.onerror = (e) => {
      console.error("[Deepgram] WebSocket error:", JSON.stringify(e));
    };

    ws.onclose = (e) => {
      console.log(
        "[Deepgram] WebSocket closed | code:",
        e.code,
        "| wasClean:",
        e.wasClean,
        "| transcript at close:",
        JSON.stringify(finalTranscriptRef.current),
      );
      wsRef.current = null;

      if (!isRecordingRef.current) {
        // Planned shutdown triggered by stopTranscription — no reconnect needed.
        setIsRecording(false);
        return;
      }

      // Unexpected close during an active session (network drop, server error,
      // WiFi ↔ mobile-data handover, etc.) — attempt reconnect with back-off.
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;
        isReconnectingRef.current = true;
        const delay =
          RECONNECT_BASE_DELAY_MS * 2 ** (reconnectAttemptsRef.current - 1);
        console.log(
          `[Deepgram] Scheduling reconnect ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay} ms`,
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (!unmountedRef.current && isRecordingRef.current) {
            connectWebSocketRef.current?.(true);
          }
        }, delay);
      } else {
        // All attempts exhausted — surface the failure to the user.
        isReconnectingRef.current = false;
        isRecordingRef.current = false;
        reconnectAttemptsRef.current = 0;
        if (!unmountedRef.current) {
          setIsRecording(false);
          setInterimTranscript("");
          Alert.alert(
            "Connection lost",
            "Could not reconnect to the transcription service. Recording has stopped.",
          );
        }
      }
    };

    wsRef.current = ws;
  }, []); // All dependencies are accessed through refs or stable state setters.

  // Keep the ref current so the recursive reconnect closure always invokes
  // the latest version of connectWebSocket.
  useEffect(() => {
    connectWebSocketRef.current = connectWebSocket;
  }, [connectWebSocket]);

  // -------------------------------------------------------------------------
  // Background / foreground handling
  // -------------------------------------------------------------------------

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "background" || !isRecordingRef.current) return;

      if (Platform.OS === "android") {
        // Android stops microphone access when the app moves to the background
        // without an explicit foreground service. This hook does not start one,
        // so audio capture will silently halt. A production implementation
        // should either launch a foreground service via a native module or stop
        // recording gracefully at this point.
        console.warn(
          "[Deepgram] App moved to background on Android during recording. " +
            "Audio capture may halt without a foreground service.",
        );
      }
      // iOS: staysActiveInBackground (set in startTranscription) keeps the
      // audio session alive in the background — no additional action needed.
    });

    return () => subscription.remove();
  }, []);

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  const startTranscription = useCallback(async () => {
    if (isRecordingRef.current || wsRef.current !== null) {
      console.warn("[Deepgram] startTranscription called while already active");
      return;
    }

    if (!DEEPGRAM_API_KEY) {
      Alert.alert(
        "Configuration error",
        "EXPO_PUBLIC_DEEPGRAM_API_KEY is not set.",
      );
      return;
    }

    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission needed", "Please enable microphone access.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      // iOS: preserve the audio session when the app enters the background so
      // transcription can continue without interruption.
      staysActiveInBackground: true,
    });

    console.log("[Deepgram] Connecting to:", DEEPGRAM_WS_URL);
    connectWebSocket(false);
  }, [connectWebSocket]);

  const stopTranscription = useCallback(async (): Promise<string> => {
    // Mark intent as stopped before any async work. This prevents a concurrent
    // onclose event from triggering a reconnect attempt during shutdown.
    isRecordingRef.current = false;
    isReconnectingRef.current = false;
    pendingChunksRef.current = [];
    reconnectAttemptsRef.current = 0;

    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    await AudioRecord.stop();
    setIsRecording(false);
    setInterimTranscript("");

    if (wsRef.current) {
      const ws = wsRef.current;

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.log("[Deepgram] Flush timeout reached, force-closing socket");
          ws.close();
          resolve();
        }, FLUSH_TIMEOUT_MS);

        // Preserve the existing onclose so teardown logic (nulling wsRef,
        // updating state) still runs after the cooperative flush completes.
        const existingOnClose = ws.onclose as ((ev: CloseEvent) => void) | null;
        ws.onclose = (e: CloseEvent) => {
          clearTimeout(timeout);
          existingOnClose?.(e);
          resolve();
        };

        try {
          ws.send(JSON.stringify({ type: "CloseStream" }));
          console.log(
            "[Deepgram] Sent CloseStream, waiting for final results…",
          );
        } catch (error) {
          console.error("[Deepgram] Failed to send CloseStream:", error);
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      });
    } else {
      // Socket was already closed by the server (e.g. speech_final timeout).
      console.log("[Deepgram] Socket already closed by server");
    }

    console.log(
      "[Deepgram] Final transcript:",
      JSON.stringify(finalTranscriptRef.current),
    );
    return finalTranscriptRef.current;
  }, []);

  const clearTranscript = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
  }, []);

  // -------------------------------------------------------------------------
  // Unmount cleanup
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      isRecordingRef.current = false;
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    finalTranscript,
    interimTranscript,
    startTranscription,
    stopTranscription,
    clearTranscript,
  };
};
