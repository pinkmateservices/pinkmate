/**
 * Theme values mirror the CSS custom properties defined in app/global.css.
 * CSS variables are the source of truth for Tailwind/NativeWind class usage.
 * This file provides the same values for inline styles and icon color props
 * that cannot use CSS variables in React Native.
 */

export const colors = {
  primary: '#EC4899',
  primaryLight: '#F472B6',
  primaryDark: '#DB2777',
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  accent: '#F59E0B',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#334155',
    borderLight: '#1E293B',
    skeleton: '#334155',
    skeletonHighlight: '#475569',
  },
}

export const gradients = {
  primary: ['#EC4899', '#DB2777'] as const,
  secondary: ['#8B5CF6', '#6D28D9'] as const,
  accent: ['#F59E0B', '#D97706'] as const,
  sunset: ['#EC4899', '#8B5CF6'] as const,
  ocean: ['#3B82F6', '#8B5CF6'] as const,
  gold: ['#F59E0B', '#EC4899'] as const,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
}

export const typography = {
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}
