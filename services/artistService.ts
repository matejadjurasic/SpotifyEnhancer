import {
  N8N_ARTISTS_BY_CITY_WEBHOOK_URL,
  N8N_CITY_MARKERS_WEBHOOK_URL,
} from "@/config/constants";
import type { CityMarker, MapArtist } from "@/types";

interface RawArtist {
  id: number;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  spotify_id: string;
  genres: string[];
  image_url: string | null;
  popularity: number;
}

function mapArtist(raw: RawArtist): MapArtist {
  return {
    id: String(raw.id),
    name: raw.name,
    city: raw.city,
    country: raw.country,
    latitude: raw.latitude,
    longitude: raw.longitude,
    spotifyId: raw.spotify_id,
    genres: raw.genres ?? [],
    imageUrl: raw.image_url,
    popularity: raw.popularity ?? 0,
  };
}

export const artistService = {
  async getCities(): Promise<CityMarker[]> {
    const res = await fetch(N8N_CITY_MARKERS_WEBHOOK_URL!);
    if (!res.ok) throw new Error(`Cities fetch failed: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return [data];
    return [];
  },

  async getRandomArtistsByCity(city: string): Promise<MapArtist[]> {
    const url = `${N8N_ARTISTS_BY_CITY_WEBHOOK_URL}?city=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Artists fetch failed: ${res.status}`);
    const data = await res.json();
    const raw: RawArtist[] = Array.isArray(data)
      ? data
      : data && typeof data === "object"
        ? [data]
        : [];
    return raw.map(mapArtist);
  },
};
