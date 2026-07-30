import { auth, database, storage } from '../config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ref, set, get, update } from 'firebase/database'
import { DB_PATHS } from '../config/constants'
import { User } from '../types'
import * as SecureStore from 'expo-secure-store'

const USER_CACHE_KEY = 'cached_user'

const saveUserCache = async (user: User) => {
  try {
    await SecureStore.setItemAsync(USER_CACHE_KEY, JSON.stringify(user))
  } catch {}
}

const clearUserCache = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_CACHE_KEY)
  } catch {}
}

export const getCachedUser = async (): Promise<User | null> => {
  try {
    const raw = await SecureStore.getItemAsync(USER_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const onAuthChanged = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const signUp = async (
  email: string,
  password: string,
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalBookings'>
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const userId = credential.user.uid

  const now = Date.now()
  const newUser: User = {
    id: userId,
    ...userData,
    status: 'active',
    totalBookings: 0,
    createdAt: now,
    updatedAt: now,
  }

  await set(ref(database, `${DB_PATHS.USERS}/${userId}`), newUser)
  await updateProfile(credential.user, { displayName: userData.fullName })
  await saveUserCache(newUser)
  return newUser
}

export const signIn = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const userId = credential.user.uid

  const snapshot = await get(ref(database, `${DB_PATHS.USERS}/${userId}`))
  if (!snapshot.exists()) throw new Error('User profile not found')

  const user: User = { id: userId, ...snapshot.val() }
  await saveUserCache(user)
  return user
}

export const logout = async () => {
  await signOut(auth)
  await clearUserCache()
}

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email)
}

export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser
  if (!firebaseUser) return null

  const snapshot = await get(ref(database, `${DB_PATHS.USERS}/${firebaseUser.uid}`))
  if (!snapshot.exists()) return null

  const user: User = { id: firebaseUser.uid, ...snapshot.val() }
  await saveUserCache(user)
  return user
}

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  const updates = { ...data, updatedAt: Date.now() }
  await update(ref(database, `${DB_PATHS.USERS}/${userId}`), updates)

  // Refresh cache with updated data
  const snapshot = await get(ref(database, `${DB_PATHS.USERS}/${userId}`))
  if (snapshot.exists()) {
    await saveUserCache({ id: userId, ...snapshot.val() })
  }
}

export const uploadProfilePhoto = async (userId: string, uri: string): Promise<string> => {
  const response = await fetch(uri)
  const blob = await response.blob()
  const fileRef = storageRef(storage, `profiles/${userId}/photo.jpg`)
  await uploadBytes(fileRef, blob)
  const url = await getDownloadURL(fileRef)
  await updateUserProfile(userId, { photoURL: url })
  return url
}
