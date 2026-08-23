import {
  N8N_NEARBY_ARTISTS_WEBHOOK_URL,
  N8N_PROFILE_WEBHOOK_URL,
  N8N_RADIO_CREATE_WEBHOOK_URL,
  N8N_RADIO_LIST_WEBHOOK_URL,
  N8N_TRANSCRIBE_WEBHOOK_URL,
  N8N_WEBHOOK_URL,
} from "@/config/constants";
import type {
  AssistantResponse,
  NearbyArtistsResponse,
  ProfileResponse,
  RadioPlaylist,
  UploadResponse,
} from "@/types";

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
  ): Promise<AssistantResponse> {
    const response = await fetch(N8N_TRANSCRIBE_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, spotify_token: spotifyToken }),
    });

    if (!response.ok) {
      let message = `Unexpected error (status ${response.status})`;
      try {
        const body = await response.json();
        if (body.error) message = body.error;
        else if (body.message) message = body.message;
      } catch {}
      throw new Error(message);
    }

    const json = await response.json();
    // n8n wraps the response in an array
    return Array.isArray(json) ? json[0] : json;
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

  async getProfile(
    spotifyToken: string,
    signal?: AbortSignal,
  ): Promise<ProfileResponse> {
    const response = await fetch(N8N_PROFILE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotify_token: spotifyToken }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  },

  async createRadioPlaylist(
    spotifyToken: string,
    city: string,
  ): Promise<RadioPlaylist> {
    const response = await fetch(N8N_RADIO_CREATE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotify_token: spotifyToken, city }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = await response.json();
    return Array.isArray(json) ? json[0] : json;
  },

  async getRadioPlaylists(spotifyToken: string): Promise<RadioPlaylist[]> {
    const response = await fetch(N8N_RADIO_LIST_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotify_token: spotifyToken }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = await response.json();
    return Array.isArray(json) ? json : [];
  },
};
