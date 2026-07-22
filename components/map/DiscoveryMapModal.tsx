import { ArtistCard } from "@/components/artists/ArtistCard";
import { artistService } from "@/services/artistService";
import { colors } from "@/styles/colors";
import type { CityMarker, MapArtist } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  type CameraRef,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface Props {
  visible: boolean;
  onClose: () => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export function DiscoveryMapModal({
  visible,
  onClose,
  initialLatitude,
  initialLongitude,
}: Props) {
  const [cities, setCities] = useState<CityMarker[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedArtists, setSelectedArtists] = useState<MapArtist[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);

  const cameraRef = useRef<CameraRef>(null);
  const panelAnim = useRef(new Animated.Value(0)).current;

  const centerLon = initialLongitude ?? 15;
  const centerLat = initialLatitude ?? 20;
  const initialZoom = initialLatitude !== undefined ? 7 : 2;

  // Fetch cities when modal opens
  useEffect(() => {
    if (visible) {
      artistService
        .getCities()
        .then((data) => setCities(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [visible]);

  // Cleanup on close
  useEffect(() => {
    if (!visible) {
      setSelectedCity(null);
      setSelectedArtists([]);
      panelAnim.setValue(0);
    }
  }, [visible, panelAnim]);

  const openPanel = useCallback(
    async (city: string) => {
      setSelectedCity(city);
      setSelectedArtists([]);
      setIsLoadingArtists(true);
      Animated.spring(panelAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
      try {
        const artists = await artistService.getRandomArtistsByCity(city);
        setSelectedArtists(artists);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingArtists(false);
      }
    },
    [panelAnim],
  );

  const closePanel = useCallback(() => {
    Animated.timing(panelAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setSelectedCity(null);
      setSelectedArtists([]);
    });
  }, [panelAnim]);

  const handleMarkerPress = useCallback(
    (city: string, lat: number, lon: number) => {
      cameraRef.current?.flyTo({ center: [lon, lat], zoom: 10, duration: 700 });
      openPanel(city);
    },
    [openPanel],
  );

  const panelTranslateY = panelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [380, 0],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.container}>
        {/* Map */}
        <Map mapStyle={MAP_STYLE} style={styles.map}>
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [centerLon, centerLat],
              zoom: initialZoom,
            }}
          />

          {cities.map((c) => (
            <Marker
              key={c.city}
              id={c.city}
              lngLat={[c.longitude, c.latitude]}
              onPress={() => handleMarkerPress(c.city, c.latitude, c.longitude)}
            >
              <View style={styles.markerOuter}>
                <View style={styles.markerInner} />
              </View>
            </Marker>
          ))}
        </Map>

        {/* Top overlay: close button + hint */}
        <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.hintBadge}>
              <Ionicons
                name="musical-notes-outline"
                size={13}
                color={colors.primary}
              />
              <Text style={styles.hintText}>
                Tap a city to discover artists
              </Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Artist panel (slides up from bottom) */}
        {selectedCity !== null && (
          <Animated.View
            style={[
              styles.panel,
              { transform: [{ translateY: panelTranslateY }] },
            ]}
          >
            <View style={styles.panelHandle} />
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelCity}>{selectedCity}</Text>
                <Text style={styles.panelSubtitle}>
                  {selectedArtists.length} artists from here
                </Text>
              </View>
              <TouchableOpacity
                onPress={closePanel}
                style={styles.panelCloseBtn}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.artistList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.artistListContent}
            >
              {isLoadingArtists ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.loader}
                />
              ) : (
                selectedArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))
              )}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const PANEL_RADIUS = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  // Marker
  markerOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(29,185,84,0.25)",
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  // Top overlay
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 12 : 12,
    gap: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(18,18,18,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  hintBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(18,18,18,0.85)",
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.25)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hintText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  // Bottom artist panel
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#181818",
    borderTopLeftRadius: PANEL_RADIUS,
    borderTopRightRadius: PANEL_RADIUS,
    borderTopWidth: 1,
    borderColor: "rgba(29,185,84,0.2)",
    paddingBottom: 32,
    maxHeight: 380,
  },
  panelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  panelCity: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  panelSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  panelCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  artistList: {
    flex: 1,
  },
  artistListContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  loader: {
    marginTop: 24,
  },
});
