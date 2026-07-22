import * as Location from "expo-location";

export interface DeviceLocation {
  country: string;
  countryCode: string;
  city: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
}

export const locationService = {
  async requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  },

  async getPermissionStatus(): Promise<Location.PermissionStatus> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  },

  async getDeviceLocation(): Promise<DeviceLocation> {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const [geocode] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    if (!geocode || !geocode.country) {
      throw new Error("Could not determine your location.");
    }

    return {
      country: geocode.country,
      countryCode: geocode.isoCountryCode ?? "",
      city: geocode.city ?? null,
      region: geocode.region ?? null,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  },
};
