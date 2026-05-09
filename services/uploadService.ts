import { N8N_WEBHOOK_URL } from "@/config/constants";
import type { UploadResponse } from "@/types";

export const uploadService = {
  async uploadAudio(
    audioUri: string,
    spotifyToken: string,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("audio", {
      uri: audioUri,
      type: "audio/mp4",
      name: "recording.m4a",
    } as any);
    formData.append("spotify_token", spotifyToken);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    return await response.json();
  },
};
