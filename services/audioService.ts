import {
  RECORDING_CONFIG,
  WHISPER_RECORDING_OPTIONS,
} from "@/config/constants";
import type { Recording } from "@/types";
import { Audio } from "expo-av";

export const audioService = {
  async requestPermission(): Promise<boolean> {
    const permission = await Audio.requestPermissionsAsync();
    return permission.granted;
  },

  async startRecording(): Promise<Recording> {
    await Audio.setAudioModeAsync(RECORDING_CONFIG.AUDIO_MODE);
    const { recording } = await Audio.Recording.createAsync(
      WHISPER_RECORDING_OPTIONS,
    );
    return recording;
  },

  async stopRecording(recording: Recording): Promise<string | null> {
    if (!recording) return null;

    await recording.stopAndUnloadAsync();
    return recording.getURI();
  },
};
