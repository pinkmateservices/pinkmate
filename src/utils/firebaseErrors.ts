/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Import `getFirebaseErrorMessage` anywhere you catch Firebase errors.
 */
const firebaseErrorMap: Record<string, string> = {
  // Sign in
  'auth/invalid-credential':       'Incorrect email or password.',
  'auth/invalid-email':            'Please enter a valid email address.',
  'auth/user-not-found':           'No account found with this email.',
  'auth/wrong-password':           'Incorrect password. Please try again.',
  'auth/too-many-requests':        'Too many attempts. Please try again later.',
  'auth/user-disabled':            'This account has been disabled.',

  // Sign up
  'auth/email-already-in-use':     'An account with this email already exists.',
  'auth/weak-password':            'Password must be at least 6 characters.',
  'auth/operation-not-allowed':    'Sign up is currently disabled.',

  // Network
  'auth/network-request-failed':   'Network error. Please check your connection.',

  // General
  'auth/internal-error':           'Something went wrong. Please try again.',
  'auth/requires-recent-login':    'Please sign in again to continue.',
}

export function getFirebaseErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return firebaseErrorMap[code] ?? fallback
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
