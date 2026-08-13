import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useMemo, useEffect } from "react";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { ArrowLeft, MapPin, Calendar, Clock, Tag, CreditCard, Trash2, Plus, Minus, CheckCircle } from "lucide-react-native";
import { colors, typography, shadows } from "../../src/config/theme";
import { useBookingStore, useAuthStore } from "../../src/store";
import { useCreateBooking, useCoupons, useBookingSettings } from "../../src/hooks";
import { Address } from "../../src/types";

function getNextDays(count: number, workingDays: number[]): { label: string; value: string }[] {
  const days = [];
  let i = 0;
  while (days.length < count) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    i += 1;
    // 0 = Sunday … 6 = Saturday (JS getDay())
    if (!workingDays.includes(d.getDay())) continue;
    const value = d.toISOString().split("T")[0];
    const label = i - 1 === 0 ? "Today" : i - 1 === 1 ? "Tomorrow"
      : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    days.push({ label, value });
  }
  return days;
}

// Converts "09:00 AM" / "06:30 PM" to minutes since midnight.
function slotToMinutes(slot: string): number {
  const match = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3].toUpperCase();
  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// A slot has already passed if its date is today and its time is earlier
// than the current time (allowing a small grace window for the current hour).
function isSlotPassed(dateValue: string, slot: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  if (dateValue !== today) return false;
  const slotMin = slotToMinutes(slot);
  if (slotMin < 0) return false;
  const now = new Date();
  return slotMin < now.getHours() * 60 + now.getMinutes();
}

// Strips undefined values so Firebase doesn't reject the payload
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    items, scheduledDate, scheduledTime,
    coupon, paymentMethod, notes,
    removeItem, updateQuantity, setDate, setTime,
    setCoupon, setPaymentMethod, setNotes, reset,
    getSubtotal, getDiscount, getTotal,
  } = useBookingStore();

  const { data: coupons = [] } = useCoupons();
  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const { settings: bookingSettings } = useBookingSettings();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const timeSlots = bookingSettings.timeSlots;
  const days = useMemo(() => getNextDays(7, bookingSettings.workingDays), [bookingSettings.workingDays]);

  useEffect(() => {
    if (scheduledTime && !timeSlots.includes(scheduledTime)) setTime("");
    if (scheduledDate && !days.some((d) => d.value === scheduledDate)) setDate("");
  }, [timeSlots, days, scheduledTime, scheduledDate, setTime, setDate]);
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const totalDuration = items.reduce((sum, i) => {
    const addOnDuration = i.selectedAddOns.reduce((s, a) => s + a.duration, 0);
    return sum + (i.duration + addOnDuration) * i.quantity;
  }, 0);

  const handleApplyCoupon = () => {
    setCouponError("");
    const found = coupons.find(
      (c) => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.active
    );
    if (!found) { setCouponError("Invalid or expired coupon code."); return; }
    const now = Date.now();
    if (now < found.validFrom || now > found.validTo) { setCouponError("This coupon has expired."); return; }
    if (subtotal < found.minOrderAmount) { setCouponError(`Minimum order ₹${found.minOrderAmount} required.`); return; }
    setCoupon(found);
    setCouponError("");
  };

  const handleConfirm = async () => {
    if (!items.length) { Alert.alert("Cart Empty", "Add at least one service."); return; }
    if (!scheduledDate) { Alert.alert("Select Date", "Please choose a date for your booking."); return; }
    if (!scheduledTime) { Alert.alert("Select Time", "Please choose a time slot."); return; }

    const bookingAddress: Address = {
      id: "auto",
      userId: user!.id,
      label: "Current Location",
      fullAddress: user?.address?.address ?? user?.city ?? "Unknown",
      latitude: user?.latitude ?? 0,
      longitude: user?.longitude ?? 0,
      isDefault: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await createBooking(stripUndefined({
        items: items.map((i) => ({
          serviceId: i.serviceId,
          serviceName: i.serviceName,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: subtotal,
        discountAmount: discount,
        couponId: coupon?.id,
        couponCode: coupon?.code,
        finalAmount: total,
        status: "Pending",
        addressId: bookingAddress.id,
        address: bookingAddress,
        scheduledDate,
        scheduledTime,
        paymentMethod,
        paymentStatus: "Pending",
        notes: notes || undefined,
        statusTimeline: [],
      }));
      reset();
      setShowSuccess(true);
    } catch (err) {
      console.log("Booking error", err);
      Alert.alert("Error", "Failed to place booking. Please try again.");
    }
  };

  if (!items.length && !showSuccess) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-gray-400 text-center" style={{ fontSize: typography.body }}>Your cart is empty.</Text>
        <TouchableOpacity className="mt-4 bg-pink-500 px-6 py-3 rounded-xl" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Browse Services</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-5 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text className="font-bold text-gray-900" style={{ fontSize: typography.h4 }}>Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cart Items */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <Text className="font-bold text-gray-900 mb-3" style={{ fontSize: typography.body }}>Services</Text>
          {items.map((item) => (
            <View key={item.serviceId} className="flex-row items-center justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="font-semibold text-gray-800" style={{ fontSize: typography.bodySmall }}>{item.serviceName}</Text>
                {item.selectedAddOns.map((a) => (
                  <Text key={a.addOnId} className="text-gray-400" style={{ fontSize: typography.caption }}>+ {a.name}</Text>
                ))}
                <Text className="text-pink-500 font-bold mt-0.5" style={{ fontSize: typography.bodySmall }}>
                  ₹{(item.price + item.selectedAddOns.reduce((s, a) => s + a.price, 0)) * item.quantity}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity className="w-7 h-7 rounded-full bg-pink-50 items-center justify-center" onPress={() => updateQuantity(item.serviceId, item.quantity - 1)}>
                  <Minus size={14} color={colors.primary} />
                </TouchableOpacity>
                <Text className="font-bold text-gray-800 w-5 text-center">{item.quantity}</Text>
                <TouchableOpacity className="w-7 h-7 rounded-full bg-pink-50 items-center justify-center" onPress={() => updateQuantity(item.serviceId, item.quantity + 1)}>
                  <Plus size={14} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity className="ml-1" onPress={() => removeItem(item.serviceId)}>
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View className="border-t border-gray-100 pt-2 mt-1 flex-row items-center gap-1.5">
            <Clock size={13} color={colors.textTertiary} />
            <Text className="text-gray-400" style={{ fontSize: typography.caption }}>Est. duration: {totalDuration} min</Text>
          </View>
        </View>

        {/* Date Picker */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <View className="flex-row items-center gap-2 mb-3">
            <Calendar size={16} color={colors.primary} />
            <Text className="font-bold text-gray-900" style={{ fontSize: typography.body }}>Select Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {days.map((d) => (
                <TouchableOpacity key={d.value} onPress={() => setDate(d.value)}
                  className={`px-4 py-2.5 rounded-xl border ${scheduledDate === d.value ? "bg-pink-500 border-pink-500" : "bg-white border-gray-200"}`}>
                  <Text className={`font-semibold text-center ${scheduledDate === d.value ? "text-white" : "text-gray-700"}`} style={{ fontSize: typography.caption }}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Time Picker */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <View className="flex-row items-center gap-2 mb-3">
            <Clock size={16} color={colors.primary} />
            <Text className="font-bold text-gray-900" style={{ fontSize: typography.body }}>Select Time</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {timeSlots.map((slot) => {
              const passed = isSlotPassed(scheduledDate ?? "", slot);
              const selected = scheduledTime === slot;
              return (
                <TouchableOpacity key={slot} onPress={() => setTime(slot)} disabled={passed}
                  className={`px-3 py-2 rounded-xl border ${selected ? "bg-pink-500 border-pink-500" : passed ? "bg-gray-100 border-gray-100" : "bg-white border-gray-200"}`}>
                  <Text className={`font-medium ${selected ? "text-white" : passed ? "text-gray-300" : "text-gray-700"}`} style={{ fontSize: typography.caption }}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Address */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 flex-row items-center gap-3" style={shadows.sm}>
          <MapPin size={18} color={colors.primary} />
          <View className="flex-1">
            <Text className="font-bold text-gray-900" style={{ fontSize: typography.body }}>Delivery Address</Text>
            <Text className="text-gray-500 mt-0.5" style={{ fontSize: typography.caption }} numberOfLines={2}>
              {user?.address?.address ?? user?.city ?? "Current location"}
            </Text>
          </View>
        </View>

        {/* Coupon */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <View className="flex-row items-center gap-2 mb-3">
            <Tag size={16} color={colors.primary} />
            <Text className="font-bold text-gray-900" style={{ fontSize: typography.body }}>Coupon</Text>
          </View>
          {coupon ? (
            <View className="flex-row items-center justify-between bg-green-50 rounded-xl px-4 py-3">
              <View>
                <Text className="font-bold text-green-700">{coupon.code}</Text>
                <Text className="text-green-600" style={{ fontSize: typography.caption }}>{coupon.description}</Text>
              </View>
              <TouchableOpacity onPress={() => { setCoupon(null); setCouponCode(""); }}>
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800"
                  placeholder="Enter coupon code"
                  placeholderTextColor="#9ca3af"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                  style={{ fontSize: typography.bodySmall }}
                />
                <TouchableOpacity className="bg-pink-500 rounded-xl px-4 items-center justify-center" onPress={handleApplyCoupon}>
                  <Text className="text-white font-bold" style={{ fontSize: typography.bodySmall }}>Apply</Text>
                </TouchableOpacity>
              </View>
              {!!couponError && <Text className="text-red-500 mt-1.5" style={{ fontSize: typography.caption }}>{couponError}</Text>}
            </>
          )}
        </View>

        {/* Payment Method */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <View className="flex-row items-center gap-2 mb-3">
            <CreditCard size={16} color={colors.primary} />
            <Text className="font-bold text-gray-900" style={{ fontSize: typography.body }}>Payment</Text>
          </View>
          <View className="flex-row gap-2">
            {(["Cash", "Card", "Online"] as const).map((method) => (
              <TouchableOpacity key={method} onPress={() => setPaymentMethod(method)}
                className={`flex-1 py-2.5 rounded-xl border items-center ${paymentMethod === method ? "bg-pink-500 border-pink-500" : "bg-white border-gray-200"}`}>
                <Text className={`font-semibold ${paymentMethod === method ? "text-white" : "text-gray-700"}`} style={{ fontSize: typography.bodySmall }}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <Text className="font-bold text-gray-900 mb-2" style={{ fontSize: typography.body }}>Notes (optional)</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            placeholder="Any special instructions..."
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ fontSize: typography.bodySmall, textAlignVertical: "top" }}
          />
        </View>

        {/* Bill Summary */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4" style={shadows.sm}>
          <Text className="font-bold text-gray-900 mb-3" style={{ fontSize: typography.body }}>Bill Summary</Text>
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-gray-500" style={{ fontSize: typography.bodySmall }}>Subtotal</Text>
            <Text className="text-gray-800 font-medium" style={{ fontSize: typography.bodySmall }}>₹{subtotal}</Text>
          </View>
          {discount > 0 && (
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-green-600" style={{ fontSize: typography.bodySmall }}>Discount</Text>
              <Text className="text-green-600 font-medium" style={{ fontSize: typography.bodySmall }}>-₹{discount}</Text>
            </View>
          )}
          <View className="border-t border-gray-100 pt-2 mt-1 flex-row justify-between">
            <Text className="font-bold text-gray-900" style={{ fontSize: typography.body }}>Total</Text>
            <Text className="font-bold text-pink-500" style={{ fontSize: typography.body }}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3 border-t border-gray-100" style={{ paddingBottom: insets.bottom + 12 }}>
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center justify-center ${isPending ? "opacity-70" : ""}`}
          style={{ backgroundColor: colors.primary }}
          onPress={handleConfirm}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold" style={{ fontSize: typography.body }}>Confirm Booking · ₹{total}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="none" statusBarTranslucent>
        <Animated.View
          entering={FadeIn.duration(250)}
          className="flex-1 bg-white items-center justify-center px-8"
        >
          <Animated.View
            entering={ZoomIn.delay(150).duration(400).springify()}
            className="w-full items-center"
          >
            <Animated.View
              entering={ZoomIn.delay(300).duration(450).springify()}
              className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6"
            >
              <CheckCircle size={52} color={colors.success} />
            </Animated.View>
            <Text className="font-bold text-gray-900 text-center mb-2" style={{ fontSize: typography.h3 }}>Booking Confirmed!</Text>
            <Text className="text-gray-500 text-center mb-10 leading-6" style={{ fontSize: typography.bodySmall }}>
              Your booking has been placed. We will notify you once it is confirmed.
            </Text>
            <TouchableOpacity
              className="w-full rounded-2xl py-4 items-center"
              style={{ backgroundColor: colors.primary }}
              activeOpacity={0.85}
              onPress={() => { setShowSuccess(false); router.replace("/(tabs)/bookings"); }}
            >
              <Text className="text-white font-bold" style={{ fontSize: typography.body }}>View My Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mt-4 py-3" onPress={() => { setShowSuccess(false); router.replace("/(tabs)"); }}>
              <Text className="text-gray-400 font-medium" style={{ fontSize: typography.bodySmall }}>Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}
