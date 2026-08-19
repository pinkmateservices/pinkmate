import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import { colors, typography, shadows } from '../../src/config/theme'
import { useAuthStore } from '../../src/store'
import { submitSupportTicket } from '../../src/services'
import { Input } from '../../src/components/ui'
import {
  ArrowLeft, Phone, Mail, MessageCircle, ChevronDown,
  HelpCircle, Send, CheckCircle2,
} from 'lucide-react-native'

const SUPPORT_PHONE_LINK = 'tel:+911800000000'
const SUPPORT_EMAIL = 'support@pinkmate.com'
const SUPPORT_WHATSAPP = 'https://wa.me/911800000000?text=Hi%20Pinkmate%20Support'

const contactOptions = [
  { icon: Phone, label: 'Call Support', sub: 'Mon–Sun, 9 AM – 9 PM', url: SUPPORT_PHONE_LINK, color: '#10B981' },
  { icon: MessageCircle, label: 'WhatsApp Us', sub: 'Quick replies on WhatsApp', url: SUPPORT_WHATSAPP, color: '#25D366' },
  { icon: Mail, label: 'Email Us', sub: 'We reply within 24 hours', url: `mailto:${SUPPORT_EMAIL}`, color: '#8B5CF6' },
]

const faqs = [
  {
    q: 'How do I book a service?',
    a: 'Browse services by category, pick your preferred partner and time slot, then confirm your booking. You can track your partner in real time once they are assigned.',
  },
  {
    q: 'How do I cancel a booking?',
    a: 'Open the booking from the Bookings tab and tap Cancel. You can cancel free of charge before a partner is assigned.',
  },
  {
    q: 'How do I get a refund?',
    a: 'Refunds for cancelled or failed bookings are processed automatically back to your original payment method within 5–7 business days.',
  },
  {
    q: 'How do I rate my partner?',
    a: 'After a service is completed, you will be prompted to rate your partner from the booking details screen. Your feedback helps us improve quality.',
  },
  {
    q: 'What if I have an issue with my service?',
    a: 'Contact us through this page and our support team will assist you. Please include your booking ID if you have one.',
  },
]

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [expanded, setExpanded] = useState<number | null>(0)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert('Cannot open', 'This option is not available on your device.')
    }
  }

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please fill in both subject and message.')
      return
    }
    setSending(true)
    try {
      await submitSupportTicket({
        userId: user?.id ?? 'guest',
        userName: user?.fullName,
        userEmail: user?.email,
        subject: subject.trim(),
        message: message.trim(),
      })
      setSubject('')
      setMessage('')
      Alert.alert(
        'Message sent',
        'Thank you for reaching out. Our support team will get back to you soon.'
      )
    } catch (err) {
      console.warn(err)
      Alert.alert('Error', 'Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100"
        style={shadows.sm}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: '#FDF2F8' }}
        >
          <ArrowLeft size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h4 }}>
          Help & Support
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Contact options */}
        <View className="flex-row gap-3 mb-6">
          {contactOptions.map(({ icon: Icon, label, sub, url, color }) => (
            <TouchableOpacity
              key={label}
              onPress={() => openLink(url)}
              activeOpacity={0.7}
              className="flex-1 bg-white rounded-2xl p-4 items-center"
              style={shadows.sm}
            >
              <View className="w-11 h-11 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${color}18` }}>
                <Icon size={20} color={color} />
              </View>
              <Text className="text-gray-900 font-semibold text-center" style={{ fontSize: typography.bodySmall }}>
                {label}
              </Text>
              <Text className="text-gray-400 text-center mt-0.5" style={{ fontSize: typography.tiny }}>
                {sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <View className="flex-row items-center mb-3">
          <HelpCircle size={18} color={colors.primary} />
          <Text className="text-gray-900 font-bold ml-2" style={{ fontSize: typography.h4 }}>
            Frequently Asked Questions
          </Text>
        </View>

        {faqs.map((faq, index) => {
          const isOpen = expanded === index
          return (
            <View key={faq.q} className="bg-white rounded-xl mb-2.5 overflow-hidden" style={shadows.sm}>
              <TouchableOpacity
                onPress={() => setExpanded(isOpen ? null : index)}
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-4"
              >
                <Text className="flex-1 text-gray-900 font-medium mr-3" style={{ fontSize: typography.bodySmall }}>
                  {faq.q}
                </Text>
                <ChevronDown
                  size={18}
                  color={colors.textTertiary}
                  style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                />
              </TouchableOpacity>
              {isOpen && (
                <Text className="px-4 pb-4 text-gray-500" style={{ fontSize: typography.bodySmall }}>
                  {faq.a}
                </Text>
              )}
            </View>
          )
        })}

        {/* Contact form */}
        <View className="flex-row items-center mt-5 mb-3">
          <Send size={18} color={colors.primary} />
          <Text className="text-gray-900 font-bold ml-2" style={{ fontSize: typography.h4 }}>
            Send us a message
          </Text>
        </View>
        <View className="bg-white rounded-2xl p-4 mb-6" style={shadows.sm}>
          <Text className="text-gray-500 mb-4" style={{ fontSize: typography.bodySmall }}>
            Tell us what went wrong or how we can help. We typically reply within 24 hours.
          </Text>

          <Input
            label="Subject"
            placeholder="e.g. Issue with my booking"
            value={subject}
            onChangeText={setSubject}
            autoCapitalize="sentences"
          />

          <Text className="text-gray-700 font-medium mb-2" style={{ fontSize: typography.bodySmall }}>
            Message
          </Text>
          <View
            className="rounded-xl border bg-white"
            style={{ borderColor: colors.border }}
          >
            <TextInput
              className="px-4 py-3.5 text-gray-900"
              style={{ fontSize: typography.body, minHeight: 110, textAlignVertical: 'top' }}
              placeholder="Describe your issue in detail..."
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={sending}
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-xl mt-4 py-3.5"
            style={{ backgroundColor: colors.primary, opacity: sending ? 0.6 : 1 }}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Send size={16} color={colors.white} />
                <Text className="text-white font-semibold ml-2" style={{ fontSize: typography.body }}>
                  Submit
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center mb-4">
          <CheckCircle2 size={14} color={colors.success} />
          <Text className="text-gray-400 ml-1.5" style={{ fontSize: typography.caption }}>
            Average response time under 24 hours
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}