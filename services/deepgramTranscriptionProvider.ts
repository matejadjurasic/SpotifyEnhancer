import { DEEPGRAM_API_KEY, DEEPGRAM_WS_URL } from "@/config/constants";
import type { TranscriptionCallbacks, TranscriptionProvider } from "@/types";

const FLUSH_TIMEOUT_MS = 3000;

interface DeepgramResultMessage {
  type: string;
  is_final: boolean;
  speech_final: boolean;
  channel?: { alternatives?: Array<{ transcript: string }> };
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function createDeepgramTranscriptionProvider(): TranscriptionProvider {
  let ws: WebSocket | null = null;

  const connect = (callbacks: TranscriptionCallbacks): void => {
    if (!DEEPGRAM_API_KEY) {
      callbacks.onError("EXPO_PUBLIC_DEEPGRAM_API_KEY is not set.");
      return;
    }

    const RNWebSocket = WebSocket as unknown as new (
      url: string,
      protocols: string[],
      options: { headers: Record<string, string> },
    ) => WebSocket;

    const socket = new RNWebSocket(DEEPGRAM_WS_URL, [], {
      headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` },
    });

    socket.onopen = () => callbacks.onConnected();

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as DeepgramResultMessage;
        if (msg.type !== "Results") return;

        const transcript = msg.channel?.alternatives?.[0]?.transcript ?? "";
        if (msg.is_final) {
          callbacks.onFinalTranscript(transcript);
          if (msg.speech_final && transcript) {
            callbacks.onSpeechFinal(transcript);
          }
        } else {
          callbacks.onInterimTranscript(transcript);
        }
      } catch (e) {
        console.warn("[DeepgramProvider] Failed to parse message:", e);
      }
    };

    socket.onerror = (e) => {
      console.error("[DeepgramProvider] WebSocket error:", JSON.stringify(e));
    };

    socket.onclose = () => {
      ws = null;
      callbacks.onDisconnected();
    };

    ws = socket;
  };

  const sendChunk = (chunk: string): void => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(base64ToArrayBuffer(chunk));
    }
  };

  const close = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!ws) {
        resolve();
        return;
      }

      const socket = ws;
      const timeout = setTimeout(() => {
        socket.close();
        resolve();
      }, FLUSH_TIMEOUT_MS);

      const originalOnClose = socket.onclose as
        | ((ev: CloseEvent) => void)
        | null;

      socket.onclose = (e: CloseEvent) => {
        clearTimeout(timeout);
        originalOnClose?.(e);
        resolve();
      };

      try {
        socket.send(JSON.stringify({ type: "CloseStream" }));
      } catch {
        clearTimeout(timeout);
        socket.close();
        resolve();
      }
    });
  };

  return { connect, sendChunk, close };
}
