import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  providerId?: string;
  createdAt?: Timestamp | Date | null;
  lastLoginAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

/**
 * Saves or updates a user document in Firestore under `users/{uid}`.
 * If the user does not exist, creates the document with createdAt.
 * If the user already exists, updates lastLoginAt and latest profile details.
 */
export async function saveUserToDatabase(user: User): Promise<UserProfileData> {
  if (!user || !user.uid) {
    throw new Error("Invalid user object provided");
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const isNew = !userSnap.exists();
  const payload: Record<string, unknown> = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    phoneNumber: user.phoneNumber ?? null,
    providerId: user.providerData?.[0]?.providerId ?? "google.com",
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (isNew) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(userRef, payload, { merge: true });

  const existingData = isNew ? null : userSnap.data();

  return {
    ...payload,
    createdAt: isNew ? new Date() : (existingData?.createdAt ?? new Date()),
    lastLoginAt: new Date(),
  } as UserProfileData;
}

/**
 * Fetches a user document from Firestore by user UID.
 */
export async function getUserFromDatabase(uid: string): Promise<UserProfileData | null> {
  if (!uid) return null;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data() as UserProfileData;
}
