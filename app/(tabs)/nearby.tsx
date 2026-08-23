import { DiscoveryMapModal } from "@/components/map/DiscoveryMapModal";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { NEARBY_ARTISTS_STRINGS } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";
import { locationService } from "@/services/locationService";
import { uploadService } from "@/services/uploadService";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import type { NearbyArtist, RadioPlaylist } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenState =
  | "idle"
  | "requesting"
  | "locating"
  | "searching"
  | "results"
  | "error";

function countryFlagEmoji(isoCode: string): string {
  if (!isoCode || isoCode.length !== 2) return "🌍";
  const codePoints = [...isoCode.toUpperCase()].map(
    (char) => 0x1f1e6 + char.charCodeAt(0) - 65,
  );
  return String.fromCodePoint(...codePoints);
}

interface ArtistCardProps {
  artist: NearbyArtist;
  index: number;
}

function ArtistCard({ artist, index }: ArtistCardProps) {
  const handlePress = () => {
    if (artist.spotifyUrl) {
      Linking.openURL(artist.spotifyUrl);
    }
  };

  return (
    <TouchableOpacity
      style={styles.artistCard}
      onPress={handlePress}
      disabled={!artist.spotifyUrl}
      activeOpacity={artist.spotifyUrl ? 0.7 : 1}
    >
      <View style={styles.artistRankBadge}>
        <Text style={styles.artistRank}>{index + 1}</Text>
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>
          {artist.name}
        </Text>
        {artist.genres && artist.genres.length > 0 && (
          <Text style={styles.artistGenres} numberOfLines={1}>
            {artist.genres.slice(0, 3).join(" · ")}
          </Text>
        )}
        {artist.popularity != null && (
          <View style={styles.popularityRow}>
            <View
              style={[
                styles.popularityBar,
                { width: `${artist.popularity}%` as any },
              ]}
            />
          </View>
        )}
      </View>
      {artist.spotifyUrl && (
        <Ionicons name="open-outline" size={16} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
}

function statusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "CREATED":
      return colors.primary;
    case "FAILED":
      return colors.danger;
    default:
      return "#f5a623";
  }
}

interface RadioPlaylistCardProps {
  playlist: RadioPlaylist;
  onPlay: (spotifyPlaylistId: string) => void;
  isPlaying: boolean;
}

function RadioPlaylistCard({
  playlist,
  onPlay,
  isPlaying,
}: RadioPlaylistCardProps) {
  const canPlay =
    playlist.status.toUpperCase() === "CREATED" &&
    !!playlist.spotify_playlist_id;
  return (
    <View style={styles.radioCard}>
      <View style={styles.radioCardContent}>
        <View
          style={[
            styles.radioStatusDot,
            { backgroundColor: statusColor(playlist.status) },
          ]}
        />
        <View style={styles.radioCardInfo}>
          <Text style={styles.radioCardName} numberOfLines={1}>
            {playlist.name}
          </Text>
          <View style={styles.radioCardMeta}>
            <Text
              style={[
                styles.radioStatusBadge,
                { color: statusColor(playlist.status) },
              ]}
            >
              {playlist.status}
            </Text>
            {playlist.message ? (
              <Text style={styles.radioCardMessage} numberOfLines={2}>
                {playlist.message}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.radioPlayBtn, !canPlay && styles.radioPlayBtnDisabled]}
        onPress={() => canPlay && onPlay(playlist.spotify_playlist_id)}
        disabled={!canPlay || isPlaying}
        activeOpacity={canPlay ? 0.7 : 1}
      >
        {isPlaying && canPlay ? (
          <ActivityIndicator size="small" color={colors.loginCardButtonText} />
        ) : (
          <Ionicons
            name="play"
            size={16}
            color={canPlay ? colors.loginCardButtonText : colors.textSecondary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function NearbyArtistsScreen() {
  const { spotifyToken, logout } = useAuth();
  const router = useRouter();
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [detectedCountryCode, setDetectedCountryCode] = useState<string>("");
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [artists, setArtists] = useState<NearbyArtist[]>([]);
  const [userLatitude, setUserLatitude] = useState<number | undefined>(
    undefined,
  );
  const [userLongitude, setUserLongitude] = useState<number | undefined>(
    undefined,
  );
  const [mapVisible, setMapVisible] = useState(false);
  const [radioPlaylists, setRadioPlaylists] = useState<RadioPlaylist[]>([]);
  const [radioLoading, setRadioLoading] = useState(false);
  const [creatingRadio, setCreatingRadio] = useState(false);
  const [playingPlaylistId, setPlayingPlaylistId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    locationService.getPermissionStatus().then(setPermissionStatus);
  }, []);

  const requestAndLocate = useCallback(async () => {
    setScreenState("requesting");
    try {
      const granted = await locationService.requestPermission();
      if (!granted) {
        setPermissionStatus(Location.PermissionStatus.DENIED);
        setScreenState("error");
        return;
      }
      setPermissionStatus(Location.PermissionStatus.GRANTED);
      await locate();
    } catch {
      setScreenState("error");
      Alert.alert(
        NEARBY_ARTISTS_STRINGS.errorTitle,
        NEARBY_ARTISTS_STRINGS.errorLocation,
      );
    }
  }, []);

  const locate = useCallback(async () => {
    setScreenState("locating");
    try {
      const location = await locationService.getDeviceLocation();
      setDetectedCountry(location.country);
      setDetectedCountryCode(location.countryCode);
      setDetectedCity(location.city);
      setUserLatitude(location.latitude);
      setUserLongitude(location.longitude);
      setScreenState("idle");
    } catch {
      setScreenState("error");
      Alert.alert(
        NEARBY_ARTISTS_STRINGS.errorTitle,
        NEARBY_ARTISTS_STRINGS.errorLocation,
      );
    }
  }, []);

  const CITY_TRANSLATIONS: Record<string, string> = {
    Београд: "Belgrade",
    Ниш: "Nis",
    Крагујевац: "Kragujevac",
    "Нови Сад": "Novi Sad",
    Суботица: "Subotica",
    Зрењанин: "Zrenjanin",
    Панчево: "Pancevo",
    Чачак: "Cacak",
    Краљево: "Kraljevo",
    Смедерево: "Smederevo",
    Лесковац: "Leskovac",
    Ужице: "Uzice",
    Ваљево: "Valjevo",
    Врање: "Vranje",
    Шабац: "Sabac",
  };

  const normalizeCityName = (city: string | null): string | null => {
    if (!city) {
      return null;
    }

    return CITY_TRANSLATIONS[city] ?? city;
  };

  const searchArtists = useCallback(async () => {
    if (!detectedCountry || !spotifyToken) return;
    setScreenState("searching");
    setArtists([]);
    try {
      const response = await uploadService.searchNearbyArtists(
        detectedCountry,
        detectedCountryCode,
        detectedCity,
        spotifyToken,
      );
      setArtists(response.artists ?? []);
      setScreenState("results");
    } catch (err) {
      setScreenState("idle");
      Alert.alert(
        NEARBY_ARTISTS_STRINGS.errorTitle,
        `${NEARBY_ARTISTS_STRINGS.errorSearch}${(err as Error).message}`,
      );
    }
  }, [detectedCountry, detectedCountryCode, detectedCity, spotifyToken]);

  const fetchRadioPlaylists = useCallback(async () => {
    if (!spotifyToken) return;
    setRadioLoading(true);
    try {
      const playlists = await uploadService.getRadioPlaylists(spotifyToken);
      setRadioPlaylists(playlists);
    } catch {
      // silent — section will just remain empty
    } finally {
      setRadioLoading(false);
    }
  }, [spotifyToken]);

  useEffect(() => {
    fetchRadioPlaylists();
  }, [fetchRadioPlaylists]);

  const getEnglishCityName = async (
    lat: number,
    lon: number,
  ): Promise<string | null> => {
    try {
      /*
      // zoom=10 resolves to city level; `name` is the matched entity (e.g. "Belgrade")
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en&zoom=10`,
        { headers: { "User-Agent": "spotify-enhancer-app" } },
      );
      const data = await res.json();
      const city =
        data?.address?.city &&
        !/(urban municipality|municipality|district)/i.test(data.address.city)
          ? data.address.city
          : null;
      const county = data?.address?.county
        ?.replace(/^city of /i, "")
        .replace(/^municipality of /i, "");
      return (
        data?.name ||
        city ||
        data?.address?.town ||
        data?.address?.village ||
        county ||
        null
      );*/
      return normalizeCityName(detectedCity);
    } catch {
      return null;
    }
  };

  const createLocalRadioPlaylist = useCallback(async () => {
    if (
      !spotifyToken ||
      !detectedCity ||
      userLatitude == null ||
      userLongitude == null
    )
      return;
    setCreatingRadio(true);
    try {
      const englishCity =
        (await getEnglishCityName(userLatitude, userLongitude)) ?? detectedCity;
      const playlist = await uploadService.createRadioPlaylist(
        spotifyToken,
        englishCity,
      );
      setRadioPlaylists((prev) => [playlist, ...prev]);
    } catch {
      Alert.alert(
        "Error",
        "Failed to create radio playlist. Please try again.",
      );
    } finally {
      setCreatingRadio(false);
    }
  }, [spotifyToken, detectedCity, userLatitude, userLongitude]);

  const playPlaylist = useCallback(
    async (spotifyPlaylistId: string) => {
      if (!spotifyToken) return;
      setPlayingPlaylistId(spotifyPlaylistId);
      try {
        const res = await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context_uri: `spotify:playlist:${spotifyPlaylistId}`,
          }),
        });
        if (!res.ok && res.status !== 204) {
          throw new Error(`status ${res.status}`);
        }
      } catch {
        Alert.alert(
          "Playback Error",
          "Could not start playback. Make sure Spotify is open and active on a device.",
        );
      } finally {
        setPlayingPlaylistId(null);
      }
    },
    [spotifyToken],
  );

  const openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const isLoading =
    screenState === "requesting" ||
    screenState === "locating" ||
    screenState === "searching";

  const locationLabel = detectedCity
    ? `${detectedCity}, ${detectedCountry}`
    : detectedCountry;

  const flag = detectedCountryCode
    ? countryFlagEmoji(detectedCountryCode)
    : null;

  return (
    <View style={commonStyles.screenRoot}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            subtitle={NEARBY_ARTISTS_STRINGS.screenSubtitle}
            onLogout={logout}
            onProfile={() => router.push("/profile")}
          />

          {/* Location status card */}
          <View style={styles.locationCard}>
            {isLoading && screenState !== "searching" ? (
              <>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.locationStatusText}>
                  {NEARBY_ARTISTS_STRINGS.detectingLocation}
                </Text>
              </>
            ) : detectedCountry ? (
              <>
                <Text style={styles.flagText}>{flag}</Text>
                <View style={styles.locationTextCol}>
                  <Text style={styles.locationFoundLabel}>
                    {NEARBY_ARTISTS_STRINGS.locationDetected}
                  </Text>
                  <Text style={styles.locationName}>{locationLabel}</Text>
                </View>
                <TouchableOpacity
                  onPress={locate}
                  style={styles.refreshBtn}
                  disabled={isLoading}
                >
                  <Ionicons name="refresh" size={18} color={colors.primary} />
                </TouchableOpacity>
              </>
            ) : permissionStatus === Location.PermissionStatus.DENIED ? (
              <>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={colors.textSecondary}
                />
                <Text style={styles.permissionText}>
                  {NEARBY_ARTISTS_STRINGS.permissionDenied}
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={colors.primary}
                />
                <Text style={styles.locationStatusText}>
                  Tap below to detect your location
                </Text>
              </>
            )}
          </View>

          {/* Action buttons */}
          {permissionStatus === Location.PermissionStatus.DENIED ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={openAppSettings}
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={colors.loginCardButtonText}
              />
              <Text style={styles.primaryButtonText}>
                {NEARBY_ARTISTS_STRINGS.enableLocation}
              </Text>
            </TouchableOpacity>
          ) : !detectedCountry ? (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isLoading && styles.primaryButtonDisabled,
              ]}
              onPress={requestAndLocate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={colors.loginCardButtonText}
                  size="small"
                />
              ) : (
                <Ionicons
                  name="navigate"
                  size={18}
                  color={colors.loginCardButtonText}
                />
              )}
              <Text style={styles.primaryButtonText}>Detect Location</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.radioCreateButton,
                  (creatingRadio || isLoading) && styles.primaryButtonDisabled,
                ]}
                onPress={createLocalRadioPlaylist}
                disabled={creatingRadio || isLoading}
              >
                {creatingRadio ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Ionicons
                    name="radio-outline"
                    size={18}
                    color={colors.primary}
                  />
                )}
                <Text style={styles.radioCreateButtonText}>
                  {creatingRadio
                    ? "Creating playlist…"
                    : "Create Local Radio Playlist"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Open Map button */}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setMapVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={18} color={colors.primary} />
            <Text style={styles.mapButtonText}>Open Discovery Map</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Artist results */}
          {screenState === "results" && (
            <View style={styles.resultsContainer}>
              {artists.length === 0 ? (
                <Text style={styles.noResultsText}>
                  {NEARBY_ARTISTS_STRINGS.noResults}
                </Text>
              ) : (
                <FlatList
                  data={artists}
                  keyExtractor={(item, i) => `${item.name}-${i}`}
                  renderItem={({ item, index }) => (
                    <ArtistCard artist={item} index={index} />
                  )}
                  scrollEnabled={false}
                  contentContainerStyle={styles.listContent}
                />
              )}
            </View>
          )}

          {/* Radio Playlists section */}
          <View style={styles.radioSection}>
            <View style={styles.radioSectionHeader}>
              <Text style={styles.radioSectionTitle}>
                Local Radio Playlists
              </Text>
              <TouchableOpacity
                onPress={fetchRadioPlaylists}
                disabled={radioLoading}
                style={styles.radioRefreshBtn}
              >
                {radioLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="refresh" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            {radioPlaylists.length === 0 && !radioLoading ? (
              <View style={styles.radioEmptyState}>
                <Ionicons
                  name="radio-outline"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text style={styles.radioEmptyText}>
                  No radio playlists yet. Detect your location and create one
                  above!
                </Text>
              </View>
            ) : (
              <View style={styles.radioList}>
                {radioPlaylists.map((playlist) => (
                  <RadioPlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onPlay={playPlaylist}
                    isPlaying={
                      playingPlaylistId === playlist.spotify_playlist_id
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <DiscoveryMapModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        initialLatitude={userLatitude}
        initialLongitude={userLongitude}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },
  radioCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    backgroundColor: "rgba(29,185,84,0.10)",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.35)",
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 24,
  },
  radioCreateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: 0.3,
  },
  radioSection: {
    alignSelf: "stretch",
    marginTop: 8,
  },
  radioSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  radioSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
  radioRefreshBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(29,185,84,0.08)",
  },
  radioEmptyState: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 10,
    backgroundColor: "rgba(29,185,84,0.04)",
    borderWidth: 1,
    borderColor: colors.transcriptCardBorder,
    borderRadius: 14,
  },
  radioEmptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  radioList: {
    gap: 10,
  },
  radioCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.transcriptCardBackground,
    borderWidth: 1,
    borderColor: colors.transcriptCardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  radioCardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radioCardInfo: {
    flex: 1,
  },
  radioCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 3,
  },
  radioCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  radioStatusBadge: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  radioCardMessage: {
    fontSize: 11,
    color: colors.danger,
    flex: 1,
  },
  radioPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  radioPlayBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.08)",
    shadowOpacity: 0,
    elevation: 0,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "stretch",
    backgroundColor: "rgba(29,185,84,0.07)",
    borderWidth: 1,
    borderColor: colors.transcriptCardBorder,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 20,
    minHeight: 64,
  },
  locationStatusText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  flagText: {
    fontSize: 32,
  },
  locationTextCol: {
    flex: 1,
  },
  locationFoundLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  refreshBtn: {
    padding: 4,
  },
  permissionText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.loginCardButtonText,
    letterSpacing: 0.4,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: 10,
    backgroundColor: "rgba(29,185,84,0.07)",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.2)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 20,
  },
  mapButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  resultsContainer: {
    flex: 1,
    alignSelf: "stretch",
  },
  listContent: {
    paddingBottom: 16,
    gap: 10,
  },
  noResultsText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },
  artistCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.transcriptCardBackground,
    borderWidth: 1,
    borderColor: colors.transcriptCardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  artistRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(29,185,84,0.15)",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  artistRank: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  artistGenres: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 5,
    textTransform: "capitalize",
  },
  popularityRow: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  popularityBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
