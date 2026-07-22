import { colors } from "@/styles/colors";
import type { MapArtist } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  artist: MapArtist;
}

export function ArtistCard({ artist }: Props) {
  const openSpotify = () => {
    const deepLink = `spotify:artist:${artist.spotifyId}`;
    const fallback = `https://open.spotify.com/artist/${artist.spotifyId}`;
    Linking.openURL(deepLink).catch(() => Linking.openURL(fallback));
  };

  return (
    <View style={styles.card}>
      {artist.imageUrl ? (
        <Image source={{ uri: artist.imageUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarText}>
            {artist.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {artist.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {artist.genres.length > 0
            ? artist.genres.slice(0, 2).join(" · ")
            : `Popularity ${artist.popularity}`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.spotifyBtn}
        onPress={openSpotify}
        activeOpacity={0.75}
      >
        <Ionicons name="open-outline" size={15} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    backgroundColor: "rgba(29,185,84,0.15)",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  spotifyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
