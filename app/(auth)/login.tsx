import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { colors, typography } from '../../src/config/theme'
import { Input, Button } from '../../src/components/ui'
import { useAuthStore } from '../../src/store'
import { getFirebaseErrorMessage } from '../../src/utils/firebaseErrors'
import { Mail, Lock } from 'lucide-react-native'
import { Image } from 'expo-image'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password)
      router.replace('/(tabs)' as any)
    } catch (err: any) {
      setError('root', { message: getFirebaseErrorMessage(err) })
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 justify-center">
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-10">
            <View className="w-24 h-24 rounded-2xl bg-pink-100 items-center justify-center mb-12">
              <Image source={require('../../assets/images/logo.png')} style={{ width: 150, height: 150 }} contentFit="contain" />
            </View>

            <Text className="text-gray-500 mt-2" style={{ fontSize: typography.body }}>
              Sign in to continue with Pinkmate
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<Mail size={20} color={colors.textTertiary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  secureTextEntry
                  icon={<Lock size={20} color={colors.textTertiary} />}
                />
              )}
            />

            {errors.root && (
              <Text className="text-red-500 text-center mb-4" style={{ fontSize: typography.caption }}>
                {errors.root.message}
              </Text>
            )}

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              className="w-full mt-2"
              size="lg"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mt-8 items-center">
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text className="text-gray-500" style={{ fontSize: typography.body }}>
                Don't have an account?{' '}
                <Text className="text-pink-500 font-semibold">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
