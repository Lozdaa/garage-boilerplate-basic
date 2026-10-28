import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!

  const encodedKey = process.env.SERVICE_ACCOUNT_KEY_BASE64

  // Deployed on Google Cloud there's no key file: the function automatically
  // runs as the project's own service account, so no credentials are needed.
  if (!encodedKey) {
    return initializeApp()
  }

  // Locally (emulator), log in with the downloaded service account key
  return initializeApp({
    credential: cert(JSON.parse(Buffer.from(encodedKey, 'base64').toString('utf8'))),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

export const adminApp = getAdminApp()
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
