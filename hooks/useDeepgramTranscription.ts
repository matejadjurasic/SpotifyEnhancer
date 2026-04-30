import { DEEPGRAM_API_KEY, DEEPGRAM_WS_URL } from "@/config/constants";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import AudioRecord from "react-native-audio-record";

const AUDIO_INIT_OPTIONS = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 6, // MIC
  wavFile: "dg_stream.wav",
};

export interface DeepgramTranscriptionHook {
  isRecording: boolean;
  finalTranscript: string;
  interimTranscript: string;
  startTranscription: () => Promise<void>;
  stopTranscription: () => Promise<string>;
  clearTranscript: () => void;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const useDeepgramTranscription = (): DeepgramTranscriptionHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const finalTranscriptRef = useRef("");

  const startTranscription = useCallback(async () => {
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
    });

    const wsUrl = DEEPGRAM_WS_URL;
    console.log("[Deepgram] Connecting to:", wsUrl);
    console.log(
      "[Deepgram] API key present:",
      !!DEEPGRAM_API_KEY,
      "| length:",
      DEEPGRAM_API_KEY.length,
    );

    // React Native's WebSocket runtime supports a third options arg for headers
    // even though the browser TS types don't include it
    const RNWebSocket = WebSocket as any;
    const ws: WebSocket = new RNWebSocket(wsUrl, [], {
      headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` },
    });

    ws.onopen = () => {
      console.log("[Deepgram] WebSocket opened successfully");
      let chunkCount = 0;
      AudioRecord.init(AUDIO_INIT_OPTIONS);
      AudioRecord.on("data", (data: string) => {
        chunkCount++;
        if (chunkCount % 20 === 0) {
          console.log(
            "[Deepgram] Audio chunks sent:",
            chunkCount,
            "| last chunk size:",
            data.length,
          );
        }
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(base64ToArrayBuffer(data));
        } else {
          console.warn(
            "[Deepgram] Tried to send audio but socket state is:",
            ws.readyState,
          );
        }
      });
      AudioRecord.start();
      console.log("[Deepgram] AudioRecord started");
      setIsRecording(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        const alt = msg.channel?.alternatives?.[0];
        console.log(
          "[Deepgram] Message type:",
          msg.type,
          "| is_final:",
          msg.is_final,
          "| speech_final:",
          msg.speech_final,
          "| transcript:",
          JSON.stringify(alt?.transcript),
        );
        if (msg.type === "Results") {
          if (msg.is_final) {
            setInterimTranscript("");
            if (alt?.transcript) {
              console.log("[Deepgram] Appending final:", alt.transcript);
              // Update ref eagerly BEFORE setState so it's readable immediately
              // regardless of React's batching/scheduling
              const next = finalTranscriptRef.current
                ? `${finalTranscriptRef.current} ${alt.transcript}`
                : alt.transcript;
              finalTranscriptRef.current = next;
              setFinalTranscript(next);
            }
          } else {
            setInterimTranscript(alt?.transcript ?? "");
          }
        }
      } catch (e) {
        console.warn("[Deepgram] Failed to parse message:", event.data, e);
      }
    };

    ws.onerror = (e) => {
      console.error("[Deepgram] WebSocket error event:", JSON.stringify(e));
      Alert.alert(
        "Connection error",
        "Failed to connect to transcription service.",
      );
    };

    ws.onclose = (e) => {
      console.log(
        "[Deepgram] WebSocket closed | code:",
        e.code,
        "| reason:",
        e.reason,
        "| wasClean:",
        e.wasClean,
        "| transcript at close:",
        JSON.stringify(finalTranscriptRef.current),
      );
      wsRef.current = null; // mark as gone so stopTranscription doesn't wait on a dead socket
      setIsRecording(false);
    };

    wsRef.current = ws;
  }, []);

  const stopTranscription = useCallback(async (): Promise<string> => {
    await AudioRecord.stop();
    setIsRecording(false);
    setInterimTranscript("");

    if (wsRef.current) {
      // Socket still open — send CloseStream and wait for Deepgram to flush
      const ws = wsRef.current;
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.log("[Deepgram] Flush timeout reached, closing socket");
          ws.close();
          resolve();
        }, 3000);

        const originalOnClose = ws.onclose;
        ws.onclose = (e) => {
          clearTimeout(timeout);
          if (originalOnClose) (originalOnClose as any)(e);
          resolve();
        };

        try {
          ws.send(JSON.stringify({ type: "CloseStream" }));
          console.log(
            "[Deepgram] Sent CloseStream, waiting for final results...",
          );
        } catch {
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      });

      wsRef.current = null;
    } else {
      // Socket was already closed by the server (speech_final timeout etc.)
      // finalTranscriptRef.current is already up-to-date
      console.log("[Deepgram] Socket was already closed by server");
    }

    console.log(
      "[Deepgram] Returning final transcript:",
      JSON.stringify(finalTranscriptRef.current),
    );
    return finalTranscriptRef.current;
  }, []);

  useEffect(() => {
    return () => {
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
    clearTranscript: () => {
      setFinalTranscript("");
      setInterimTranscript("");
      finalTranscriptRef.current = "";
    },
  };
};
