import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import { colors, typography } from "../../config/theme";
import { useBookingStore } from "../../store";

interface Props {
  color?: string;
  size?: number;
}

export function CartIcon({ color = colors.text, size = 22 }: Props) {
  const router = useRouter();
  const items = useBookingStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <TouchableOpacity
      className="relative p-1"
      onPress={() => router.push("/booking")}
      activeOpacity={0.7}
    >
      <ShoppingBag size={size} color={color} />
      {totalItems > 0 && (
        <View
          className="absolute -top-0.5 -right-0.5 rounded-full items-center justify-center"
          style={{
            width: 16,
            height: 16,
            backgroundColor: colors.primary,
          }}
        >
          <Text className="text-white font-bold" style={{ fontSize: 9 }}>
            {totalItems > 9 ? "9+" : totalItems}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
