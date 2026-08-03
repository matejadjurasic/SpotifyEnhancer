import { DiscoveryMapModal } from "@/components/map/DiscoveryMapModal";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { NEARBY_ARTISTS_STRINGS } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";
import { locationService } from "@/services/locationService";
import { uploadService } from "@/services/uploadService";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import type { NearbyArtist } from "@/types";
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
      <SafeAreaView style={commonStyles.screenSafeArea}>
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

        {/* Action button */}
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
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isLoading && styles.primaryButtonDisabled,
            ]}
            onPress={searchArtists}
            disabled={isLoading}
          >
            {screenState === "searching" ? (
              <ActivityIndicator
                color={colors.loginCardButtonText}
                size="small"
              />
            ) : (
              <Ionicons
                name="search"
                size={18}
                color={colors.loginCardButtonText}
              />
            )}
            <Text style={styles.primaryButtonText}>
              {screenState === "searching"
                ? NEARBY_ARTISTS_STRINGS.searchingArtists
                : NEARBY_ARTISTS_STRINGS.searchButton}
            </Text>
          </TouchableOpacity>
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

        {/* Results */}
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
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        )}
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
