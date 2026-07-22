import {
  N8N_NEARBY_ARTISTS_WEBHOOK_URL,
  N8N_TRANSCRIBE_WEBHOOK_URL,
  N8N_WEBHOOK_URL,
} from "@/config/constants";
import type { NearbyArtistsResponse, UploadResponse } from "@/types";

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

  async sendTranscript(
    transcript: string,
    spotifyToken: string,
  ): Promise<void> {
    const response = await fetch(N8N_TRANSCRIBE_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, spotify_token: spotifyToken }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
  },

  async searchNearbyArtists(
    country: string,
    countryCode: string,
    city: string | null,
    spotifyToken: string,
  ): Promise<NearbyArtistsResponse> {
    const response = await fetch(N8N_NEARBY_ARTISTS_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country,
        country_code: countryCode,
        city,
        spotify_token: spotifyToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  },
};
