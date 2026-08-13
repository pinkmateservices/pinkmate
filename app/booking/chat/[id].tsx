import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Image } from 'expo-image'
import { ArrowLeft, Send, MessageCircle } from 'lucide-react-native'
import { colors, typography } from '../../../src/config/theme'
import { useAuthStore } from '../../../src/store'
import {
  useBooking, useLivePartner, useConversationMessages, useSendChatMessage, useMarkConversationRead,
} from '../../../src/hooks'
import { ChatMessage } from '../../../src/services/database'

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function BookingChatScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const bookingId = (id as string) || ''

  const user = useAuthStore((s) => s.user)
  const { data: booking } = useBooking(bookingId)
  const partnerId = booking?.assignedPartnerId ?? ''
  const { data: partner } = useLivePartner(partnerId)

  const { messages, loading } = useConversationMessages(bookingId)
  const sendMutation = useSendChatMessage()
  const markRead = useMarkConversationRead()

  const [input, setInput] = useState('')
  const listRef = useRef<FlatList<ChatMessage>>(null)

  // Mark the partner's messages as read whenever new ones arrive.
  useEffect(() => {
    if (!partnerId || !user) return
    const hasUnreadIncoming = messages.some((m) => m.senderId !== user.id && !m.read)
    if (hasUnreadIncoming) markRead.mutate(bookingId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, partnerId, user?.id])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sendMutation.isPending || !partnerId) return
    setInput('')
    Keyboard.dismiss()
    try {
      await sendMutation.mutateAsync({ bookingId, text, partnerId })
    } catch {
      setInput(text)
    }
  }, [input, sendMutation, bookingId, partnerId])

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.senderId === user?.id
    return (
      <View className={`max-w-[78%] mb-2 ${mine ? 'self-end items-end' : 'self-start items-start'}`}>
        <View
          className={`px-4 py-2.5 rounded-2xl ${mine ? 'rounded-br-md' : 'rounded-bl-md'}`}
          style={{
            backgroundColor: mine ? colors.primary : '#FFFFFF',
            ...(mine ? {} : { borderWidth: 1, borderColor: colors.border }),
          }}
        >
          <Text className={mine ? 'text-white' : 'text-gray-800'} style={{ fontSize: typography.bodySmall, lineHeight: 20 }}>
            {item.text}
          </Text>
        </View>
        <Text className="text-gray-400 mt-1 px-1" style={{ fontSize: typography.tiny }}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    )
  }

  const partnerName = partner?.fullName ?? 'Partner'
  const partnerInitial = partnerName.charAt(0).toUpperCase()

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center overflow-hidden">
          {partner?.photoUrl ? (
            <Image source={{ uri: partner.photoUrl }} style={{ width: 40, height: 40 }} contentFit="cover" />
          ) : (
            <Text className="text-pink-600 font-bold" style={{ fontSize: typography.bodySmall }}>
              {partnerInitial}
            </Text>
          )}
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-gray-900 font-bold" style={{ fontSize: typography.bodySmall }} numberOfLines={1}>
            {partnerName}
          </Text>
          <Text className="text-gray-400" style={{ fontSize: typography.caption }}>
            Assigned partner · {booking?.id?.slice(-6)?.toUpperCase() ?? ''}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10">
            <View className="w-16 h-16 rounded-full bg-pink-50 items-center justify-center mb-4">
              <MessageCircle size={28} color={colors.primary} />
            </View>
            <Text className="text-gray-900 font-semibold text-center" style={{ fontSize: typography.body }}>
              Say hello to your partner
            </Text>
            <Text className="text-gray-400 text-center mt-1.5" style={{ fontSize: typography.caption }}>
              Chat about your booking, share updates, or ask anything before your service begins.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        )}
      </View>

      {/* Input bar */}
      <View className="bg-white px-4 pt-3 flex-row items-end" style={{ paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
        <TextInput
          className="flex-1 max-h-[100px] bg-gray-100 rounded-2xl px-4 py-2.5 text-gray-900 mr-2"
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={setInput}
          multiline
          style={{ fontSize: typography.bodySmall }}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sendMutation.isPending || !input.trim()}
          activeOpacity={0.8}
          className={`w-11 h-11 rounded-full items-center justify-center ${input.trim() ? '' : 'opacity-50'}`}
          style={{ backgroundColor: colors.primary }}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
