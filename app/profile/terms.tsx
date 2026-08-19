import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'
import { colors, typography, shadows } from '../../src/config/theme'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using the Pinkmate application, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree with any part of these terms, please do not use the app.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years of age to use our services. By creating an account, you confirm that you are eligible and that all information you provide is accurate and up to date.',
  },
  {
    title: '3. Account Responsibility',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately if you suspect any unauthorised use of your account.',
  },
  {
    title: '4. Booking Services',
    body: 'Bookings are confirmed based on availability of service partners. We reserve the right to refuse or cancel a booking in case of unavailability, technical issues, or any other reason, with due notification and applicable refunds.',
  },
  {
    title: '5. Payments',
    body: 'Service charges, applicable taxes and any add-on charges are shown before you confirm a booking. Payments may be made through the available methods. All payments are subject to our payment partners’ terms.',
  },
  {
    title: '6. Cancellations & Refunds',
    body: 'You may cancel a booking free of charge before a service partner is assigned. Cancellations after assignment or no-shows may be subject to a cancellation fee. Refunds are processed to the original payment method as described in the refund policy.',
  },
  {
    title: '7. User Conduct',
    body: 'You agree not to misuse the app, interfere with its operation, attempt to gain unauthorised access, or use it for any unlawful purpose. Any abusive behaviour towards service partners or other users may result in account suspension or termination.',
  },
  {
    title: '8. Service Partner Conduct',
    body: 'Service partners are independent professionals. While we strive to maintain high quality standards, Pinkmate is not directly responsible for the acts or omissions of individual service partners beyond our platform facilitation role.',
  },
  {
    title: '9. Intellectual Property',
    body: 'All content in the app, including text, graphics, logos, and software, is the property of Pinkmate or its licensors and is protected by applicable intellectual property laws. You may not copy, reproduce or distribute it without permission.',
  },
  {
    title: '10. Limitation of Liability',
    body: 'To the maximum extent permitted by law, Pinkmate shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the app or services, including loss of profits, data, or goodwill.',
  },
  {
    title: '11. Changes to Terms',
    body: 'We may update these Terms & Conditions from time to time. Updated terms will be posted in the app, and continued use of the app after changes take effect constitutes acceptance of the revised terms.',
  },
  {
    title: '12. Governing Law',
    body: 'These terms are governed by the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of the place where Pinkmate is registered.',
  },
  {
    title: '13. Contact Us',
    body: 'If you have any questions about these Terms & Conditions, please reach out through the Help & Support section of the app or email us at support@pinkmate.com.',
  },
]

export default function TermsConditionsScreen() {
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
          Terms & Conditions
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <Text className="text-gray-900 font-bold mb-1" style={{ fontSize: typography.h3 }}>
          Pinkmate Terms & Conditions
        </Text>
        <Text className="text-gray-400 mb-6" style={{ fontSize: typography.caption }}>
          Last updated: 19 August 2026
        </Text>

        <Text className="text-gray-600 mb-6" style={{ fontSize: typography.bodySmall }}>
          These Terms & Conditions govern your use of the Pinkmate mobile application and the
          services offered through it. Please read them carefully before using the app.
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
