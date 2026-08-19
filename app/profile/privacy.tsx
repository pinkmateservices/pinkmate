import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'
import { colors, typography, shadows } from '../../src/config/theme'

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect the information you provide when you create an account, such as your name, email address, phone number, gender, city and state. We also collect details about your bookings, services availed, and any preferences you set within the app.',
  },
  {
    title: '2. Location Data',
    body: 'With your permission, we access your device location to match you with nearby service partners, provide accurate service addresses, and let you track your assigned partner in real time. Location data is used only to fulfil and improve your service experience and is never sold to third parties.',
  },
  {
    title: '3. How We Use Your Information',
    body: 'We use your information to create and manage your account, process and deliver bookings, handle payments and payouts, send service updates and notifications, respond to support requests, and improve the quality of our services. We may also use aggregated, anonymised data for analytics.',
  },
  {
    title: '4. Payment Information',
    body: 'Payments for services are processed through secure third-party payment providers. We do not store your full card details or bank account numbers on our servers. Please refer to our payment partner’s privacy policy for details on how payment data is handled.',
  },
  {
    title: '5. Sharing of Information',
    body: 'We share relevant information with service partners only as necessary to fulfil your booking — for example your name, phone number and service address so they can reach you. We may also share information with service providers who help us operate the platform, such as payment processors and cloud infrastructure providers.',
  },
  {
    title: '6. Data Security',
    body: 'We take reasonable technical and organisational measures to protect your personal information from unauthorised access, alteration, disclosure or destruction. However, no method of transmission over the internet or electronic storage is completely secure.',
  },
  {
    title: '7. Your Rights',
    body: 'You can access and update your personal information through your profile in the app. You may also request deletion of your account and associated data by contacting our support team. You can control location and notification permissions through your device settings.',
  },
  {
    title: '8. Data Retention',
    body: 'We retain your personal information for as long as your account is active or as needed to provide you with our services, comply with legal obligations, resolve disputes, and enforce our agreements.',
  },
  {
    title: '9. Children’s Privacy',
    body: 'Our services are not intended for children under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.',
  },
  {
    title: '10. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. When we make changes, we will notify you through the app or by other means. Your continued use of the app after changes take effect constitutes acceptance of the updated policy.',
  },
  {
    title: '11. Contact Us',
    body: 'If you have any questions about this Privacy Policy or how we handle your data, please reach out through the Help & Support section of the app or email us at support@pinkmate.com.',
  },
]

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

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
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <Text className="text-gray-900 font-bold mb-1" style={{ fontSize: typography.h3 }}>
          Pinkmate Privacy Policy
        </Text>
        <Text className="text-gray-400 mb-6" style={{ fontSize: typography.caption }}>
          Last updated: 19 August 2026
        </Text>

        <Text className="text-gray-600 mb-6" style={{ fontSize: typography.bodySmall }}>
          This Privacy Policy explains how Pinkmate collects, uses, shares and protects your personal
          information when you use our mobile application and services. By using the app, you agree to
          the practices described in this policy.
        </Text>

        {sections.map((section) => (
          <View key={section.title} className="bg-white rounded-xl p-4 mb-3" style={shadows.sm}>
            <Text className="text-gray-900 font-semibold mb-2" style={{ fontSize: typography.body }}>
              {section.title}
            </Text>
            <Text className="text-gray-500 leading-5" style={{ fontSize: typography.bodySmall }}>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
