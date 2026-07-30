import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { colors, typography } from '../../src/config/theme'
import { Input, Button, LocationPicker } from '../../src/components/ui'
import { useAuthStore } from '../../src/store'
import { getFirebaseErrorMessage } from '../../src/utils/firebaseErrors'
import { useIndiaStates, useIndiaCities } from '../../src/hooks/useLocation'
import { Mail, Lock, User, Phone } from 'lucide-react-native'

const GENDERS = ['Male', 'Female', 'Other'] as const
type Gender = typeof GENDERS[number]

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  gender: z.enum(['Male', 'Female', 'Other'], { error: 'Please select your gender' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  state: z.string().min(2, 'Please select your state'),
  stateIso2: z.string(),
  city: z.string().min(2, 'Please select your city'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterScreen() {
  const router = useRouter()
  const signUp = useAuthStore((s) => s.signUp)

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '', email: '', phoneNumber: '',
      gender: 'Female' as Gender,
      password: '', confirmPassword: '',
      state: '', stateIso2: '', city: '',
    },
  })

  const stateIso2 = watch('stateIso2')
  const { states, loading: statesLoading } = useIndiaStates()
  const { cities, loading: citiesLoading } = useIndiaCities(stateIso2)

  const onSubmit = async (data: RegisterForm) => {
    try {
      await signUp(data.email, data.password, {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        city: data.city,
        state: data.state,
        photoURL: '',
      })
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
        <View className="flex-1 px-6 justify-center py-8">
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
            <Text className="text-gray-900 font-bold" style={{ fontSize: typography.h1 }}>
              Create Account
            </Text>
            <Text className="text-gray-500 mt-2" style={{ fontSize: typography.body }}>
              Join Pinkmate for premium beauty services
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.fullName?.message}
                  icon={<User size={20} color={colors.textTertiary} />}
                />
              )}
            />

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
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={value}
                  onChangeText={onChange}
                  error={errors.phoneNumber?.message}
                  keyboardType="phone-pad"
                  icon={<Phone size={20} color={colors.textTertiary} />}
                />
              )}
            />

            {/* Gender selector */}
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                  <Text className="text-gray-700 font-medium mb-2" style={{ fontSize: typography.bodySmall }}>
                    Gender
                  </Text>
                  <View className="flex-row gap-3">
                    {GENDERS.map((g) => {
                      const selected = value === g
                      return (
                        <TouchableOpacity
                          key={g}
                          onPress={() => onChange(g)}
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            alignItems: 'center',
                            backgroundColor: selected ? colors.primary : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          }}
                        >
                          <Text style={{
                            fontSize: typography.bodySmall,
                            fontWeight: '600',
                            color: selected ? colors.white : colors.textSecondary,
                          }}>
                            {g}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                  {errors.gender && (
                    <Text className="text-red-500 mt-1" style={{ fontSize: typography.caption }}>
                      {errors.gender.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* State dropdown */}
            <Controller
              control={control}
              name="state"
              render={({ field: { value } }) => (
                <LocationPicker
                  label="State"
                  placeholder="Select your state"
                  value={value}
                  items={states}
                  loading={statesLoading}
                  error={errors.state?.message}
                  onChange={(item) => {
                    setValue('state', item.name, { shouldValidate: true })
                    setValue('stateIso2', item.iso2)
                    setValue('city', '')  // reset city when state changes
                  }}
                />
              )}
            />

            {/* City dropdown */}
            <Controller
              control={control}
              name="city"
              render={({ field: { value } }) => (
                <LocationPicker
                  label="City"
                  placeholder={stateIso2 ? 'Select your city' : 'Select a state first'}
                  value={value}
                  items={cities}
                  loading={citiesLoading}
                  disabled={!stateIso2}
                  error={errors.city?.message}
                  onChange={(item) => setValue('city', item.name, { shouldValidate: true })}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="Create a password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  secureTextEntry
                  icon={<Lock size={20} color={colors.textTertiary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
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
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              className="w-full mt-2"
              size="lg"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mt-6 items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-gray-500" style={{ fontSize: typography.body }}>
                Already have an account?{' '}
                <Text className="text-pink-500 font-semibold">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
