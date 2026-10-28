import type { Timestamp } from 'firebase/firestore'

/**
 * Firestore collection type definitions.
 *
 * Keep in sync with:
 *   - src/lib/firebase/firestore.ts  (typed collection exports)
 *   - firebase/firestore.rules       (security rules)
 *   - docs/FIRESTORE-SCHEMA.md       (schema documentation)
 *
 * When adding a new collection, use the /firebase-collection skill.
 */

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: 'user'
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1
}

/** 
 - Pendants Related Model: This is only written by the backend 
**/
// These field names match backend EXACTLY - Firestore is case-sensitive

/**  
 This is the reading from the pi/pendant
 - Will be stored as lastReading on pendant
**/
export interface PendantReading {
  temperature?: number
  humidity?: number
  pressure?: number
  acceleration?: {x: number; y: number; z: number}
  orientation?: {pitch:number; roll: number; yaw: number}
  sosPressed?: boolean
}

/** 
 pendants/{pendantID}
 - This is pendant's live state
**/
export interface Pendant {
  id: string
  lastReading?: PendantReading
  lastPing?: Timestamp
  warnings?: string[]
  dangerActive?: boolean
  dangerReasons?: string[]
  currentAlertID?: string | null
  sosActive?: boolean
  sosAt?: Timestamp
  _schemaVersion: 1
}

/** 
 alerts/{alertID}
 - One alert per danger episode 
**/
export interface PendantAlert {
  id: string
  pendantID: string
  type: 'DANGER'
  reasons: string[]
  evidence: {
    temperature: number | null
    humidity: number | null
    pressure: number | null
    acceleration: {x: number; y: number; z: number} | null
  }
  status: 'active' | 'resolved'
  startedAt: Timestamp
  resolvedAt: Timestamp | null
  _schemaVersion: 1
}

export type CreateUserProfileInput = Omit<UserProfile, 'createdAt' | 'updatedAt'>
