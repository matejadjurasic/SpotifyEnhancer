import { audioService } from "@/services/audioService";
import { uploadService } from "@/services/uploadService";
import type { Recording, RecordingHookReturn, UploadResponse } from "@/types";
import { useState } from "react";
import { Alert } from "react-native";

export const useRecording = (
  spotifyToken: string | null,
): RecordingHookReturn => {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const startRecording = async (): Promise<void> => {
    try {
      const hasPermission = await audioService.requestPermission();
      if (!hasPermission) {
        Alert.alert("Permission needed", "Please enable microphone access");
        return;
      }

      const newRecording = await audioService.startRecording();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to start recording: ${(error as Error).message}`,
      );
    }
  };

  const stopRecording = async (): Promise<void> => {
    if (!recording) return;

    try {
      setIsRecording(false);
      const uri = await audioService.stopRecording(recording);
      setRecording(null);

      if (uri && spotifyToken) {
        await uploadRecording(uri);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to stop recording: ${(error as Error).message}`,
      );
    }
  };

  const uploadRecording = async (uri: string): Promise<void> => {
    if (!spotifyToken) {
      Alert.alert("Error", "No Spotify token available");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadService.uploadAudio(uri, spotifyToken);
      setResult(response);
      setShowConfirm(true);
    } catch (error) {
      Alert.alert("Error", `Upload failed: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isRecording,
    isUploading,
    startRecording,
    stopRecording,
    result,
    showConfirm,
    setShowConfirm,
  };
};
