import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { initializeAuth, getAuth, inMemoryPersistence, Auth } from 'firebase/auth'
import { getDatabase, Database } from 'firebase/database'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
}

let app: FirebaseApp
let auth: Auth
let database: Database
let storage: FirebaseStorage

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  auth = initializeAuth(app, { persistence: inMemoryPersistence })
  database = getDatabase(app)
  storage = getStorage(app)
} else {
  app = getApps()[0]
  auth = getAuth(app)
  database = getDatabase(app)
  storage = getStorage(app)
}

export { app, auth, database, storage }
