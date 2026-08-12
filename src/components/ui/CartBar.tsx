import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import { colors, typography } from "../../config/theme";
import { useBookingStore } from "../../store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  serviceDetails?: boolean;
}

export function CartBar({ serviceDetails = false }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useBookingStore((s) => s.items);
  const getTotal = useBookingStore((s) => s.getTotal);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  if (totalItems === 0) return null;

  // On tab screens sit just above tab bar, on full screens sit above bottom bar
  const bottomOffset = serviceDetails
    ? insets.bottom + 80
    : insets.bottom + 60;

  return (
    <TouchableOpacity
      className="absolute left-4 right-4 flex-row items-center justify-between rounded-2xl px-5 py-3.5"
      style={{
        bottom: bottomOffset,
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
      }}
      onPress={() => router.push("/booking")}
      activeOpacity={0.9}
    >
      <View className="flex-row items-center gap-2">
        <View className="bg-white/20 rounded-full w-7 h-7 items-center justify-center">
          <Text className="text-white font-bold" style={{ fontSize: typography.caption }}>
            {totalItems}
          </Text>
        </View>
        <Text className="text-white font-semibold" style={{ fontSize: typography.bodySmall }}>
          {totalItems} {totalItems === 1 ? "item" : "items"} in cart
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Text className="text-white font-bold" style={{ fontSize: typography.body }}>
          ₹{getTotal()}
        </Text>
        <ShoppingBag size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}
