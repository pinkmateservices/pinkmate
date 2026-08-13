import { View, Text, Modal, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import { Star, X, CheckCircle } from 'lucide-react-native'
import { colors, typography } from '../../config/theme'
import { usePartnerById, useReviewForBooking, useSubmitReview } from '../../hooks'
import { Booking } from '../../types'

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

interface RatePartnerModalProps {
  booking: Booking | null
  visible: boolean
  onClose: () => void
}

export default function RatePartnerModal({ booking, visible, onClose }: RatePartnerModalProps) {
  const bookingId = booking?.id ?? ''
  const partnerId = booking?.assignedPartnerId ?? ''

  const { data: partner } = usePartnerById(partnerId)
  const { data: existing } = useReviewForBooking(bookingId)
  const submit = useSubmitReview()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (visible) {
      setRating(existing?.rating ?? 0)
      setComment(existing?.comment ?? '')
      setSubmitted(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, bookingId])

  const isAlreadyRated = !!existing && !submitted

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Select a rating', 'Tap the stars to rate your partner.')
      return
    }
    try {
      await submit.mutateAsync({
        partnerId,
        bookingId,
        rating,
        comment: comment.trim() || undefined,
        serviceNames: booking?.items.map((i) => i.serviceName) ?? [],
      })
      setSubmitted(true)
    } catch {
      Alert.alert('Failed', 'Could not submit your rating. Please try again.')
    }
  }

  const handleClose = () => {
    if (submit.isPending) return
    setSubmitted(false)
    onClose()
  }

  const partnerName = partner?.fullName ?? 'your partner'

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full bg-white rounded-3xl p-6">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h4 }}>
                  {isAlreadyRated ? 'Your rating' : 'Rate your partner'}
                </Text>
                {!isAlreadyRated && (
                  <Text className="text-gray-400 mt-1" style={{ fontSize: typography.caption }}>
                    How was {partnerName}?
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={handleClose} className="p-1" disabled={submit.isPending}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {isAlreadyRated || submitted ? (
              <View className="items-center py-6">
                <View className="flex-row">
                  {(existing?.rating ?? rating) ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={28}
                        color={colors.accent}
                        fill={i < (existing?.rating ?? rating) ? colors.accent : 'transparent'}
                      />
                    ))
                  ) : null}
                </View>
                <Text className="text-gray-900 font-semibold mt-3" style={{ fontSize: typography.body }}>
                  {submitted ? 'Thank you for your feedback!' : `You rated ${(existing?.rating ?? 0)}/5`}
                </Text>
                {!!(existing?.comment ?? comment) && (
                  <Text className="text-gray-500 text-center mt-2" style={{ fontSize: typography.bodySmall }}>
                    {(existing?.comment ?? comment)}
                  </Text>
                )}
                <TouchableOpacity className="mt-6 bg-gray-100 rounded-xl px-6 py-3" onPress={handleClose}>
                  <Text className="text-gray-700 font-semibold" style={{ fontSize: typography.bodySmall }}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View className="items-center py-4">
                  <View className="flex-row">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const filled = i < rating
                      return (
                        <TouchableOpacity key={i} onPress={() => setRating(i + 1)} className="px-1.5 py-1">
                          <Star size={32} color={filled ? colors.accent : colors.border} fill={filled ? colors.accent : 'transparent'} />
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                  <Text className="text-gray-500 mt-2" style={{ fontSize: typography.caption }}>
                    {rating > 0 ? RATING_LABELS[rating] : 'Tap a star to rate'}
                  </Text>
                </View>

                <TextInput
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 min-h-[80px]"
                  placeholder="Share your experience (optional)"
                  placeholderTextColor="#9ca3af"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={3}
                  style={{ fontSize: typography.bodySmall, textAlignVertical: 'top' }}
                />

                <TouchableOpacity
                  className="mt-4 rounded-2xl py-4 items-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={handleSubmit}
                  disabled={submit.isPending}
                  activeOpacity={0.85}
                >
                  {submit.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold" style={{ fontSize: typography.body }}>Submit Rating</Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row items-center justify-center mt-4">
                  <CheckCircle size={14} color={colors.textTertiary} />
                  <Text className="text-gray-400 ml-1.5" style={{ fontSize: typography.tiny }}>
                    Your rating helps other customers choose the right partner.
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
