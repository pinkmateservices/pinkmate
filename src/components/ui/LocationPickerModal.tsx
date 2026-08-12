import { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, MapPin, Check, Navigation } from "lucide-react-native";
import { colors, typography } from "../../config/theme";
import { getCurrentCoordinates } from "../../hooks/useLocation";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

interface PickedLocation {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
}

interface Props {
  visible: boolean;
  initialLatitude?: number;
  initialLongitude?: number;
  onConfirm: (location: PickedLocation) => void;
  onClose: () => void;
}

const DEFAULT_REGION: Region = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

export default function LocationPickerModal({
  visible,
  initialLatitude,
  initialLongitude,
  onConfirm,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: initialLatitude ?? DEFAULT_REGION.latitude,
    longitude: initialLongitude ?? DEFAULT_REGION.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [pickedAddress, setPickedAddress] = useState<string>("");

  const reverseGeocode = async (lat: number, lng: number): Promise<PickedLocation> => {
    const res = await fetch(
      `https://geocode.googleapis.com/v4/geocode/location?location.latitude=${lat}&location.longitude=${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const json = await res.json();
    const result = json.results?.[0];
    const components: { longText: string; types: string[] }[] =
      result?.addressComponents ?? [];
    const get = (type: string) =>
      components.find((c) => c.types.includes(type))?.longText;
    return {
      latitude: lat,
      longitude: lng,
      address: result?.formattedAddress ?? "",
      city:
        get("locality") ||
        get("sublocality_level_1") ||
        get("administrative_area_level_3"),
      state: get("administrative_area_level_1"),
    };
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    setResolving(true);
    try {
      const result = await reverseGeocode(newRegion.latitude, newRegion.longitude);
      setPickedAddress(result.address);
    } catch {
      setPickedAddress("");
    } finally {
      setResolving(false);
    }
  };

  const handlePlaceSelect = (data: any, details: any) => {
    if (!details?.geometry?.location) return;
    const { lat, lng } = details.geometry.location;
    const newRegion: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    setPickedAddress(details.formatted_address ?? data.description);
    mapRef.current?.animateToRegion(newRegion, 400);
  };

  const handleGoToCurrentLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoordinates();
      if (!coords) return;
      const newRegion: Region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = async () => {
    setResolving(true);
    try {
      const result = await reverseGeocode(region.latitude, region.longitude);
      onConfirm(result);
    } finally {
      setResolving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h4 }}>
            Choose Location
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Map + overlaid controls */}
        <View className="flex-1">
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider="google"
            initialRegion={region}
            onRegionChangeComplete={handleRegionChangeComplete}
          />

          {/* Search bar floating over the map */}
          <View className="absolute top-3 left-3 right-3 z-10">
            <GooglePlacesAutocomplete
              placeholder="Search for a location..."
              fetchDetails
              onPress={handlePlaceSelect}
              query={{ key: GOOGLE_MAPS_API_KEY, language: "en" }}
              styles={{
                textInputContainer: {
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  backgroundColor: "#fff",
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                },
                textInput: {
                  height: 44,
                  fontSize: 14,
                  backgroundColor: "transparent",
                  color: "#111",
                  borderRadius: 12,
                },
                listView: {
                  borderRadius: 12,
                  marginTop: 4,
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                },
              }}
              enablePoweredByContainer={false}
              textInputProps={{ placeholderTextColor: "#9ca3af" }}
            />
          </View>

          {/* Fixed center pin */}
          <View
            className="absolute left-1/2 top-1/2 -ml-[18px] -mt-9"
            pointerEvents="none"
          >
            <MapPin size={36} color={colors.primary} fill={colors.primary + "33"} />
          </View>

          {/* Current location FAB — bottom right */}
          <TouchableOpacity
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white items-center justify-center shadow-md elevation-5"
            onPress={handleGoToCurrentLocation}
            activeOpacity={0.85}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Navigation size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom sheet */}
        <View
          className="bg-white px-5 pt-4 border-t border-gray-100 gap-3.5"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-start gap-2">
            <MapPin size={16} color={colors.primary} />
            {resolving ? (
              <ActivityIndicator size="small" color={colors.primary} className="ml-2" />
            ) : (
              <Text
                className="flex-1 text-gray-700 leading-5"
                style={{ fontSize: typography.body }}
                numberOfLines={2}
              >
                {pickedAddress || "Move the map to pick a location"}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className={`flex-row items-center justify-center gap-2 rounded-2xl py-3.5 ${!pickedAddress || resolving ? "opacity-50" : ""}`}
            style={{ backgroundColor: colors.primary }}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={resolving || !pickedAddress}
          >
            <Check size={18} color="#fff" />
            <Text className="text-white font-bold" style={{ fontSize: typography.body }}>
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
