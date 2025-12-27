import { db } from "../firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export type UserProfile = {
  screenName: string;
  theme: "dark" | "light";
  updatedAt?: unknown;
  createdAt?: unknown;
};

export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function upsertUserProfile(
  uid: string,
  patch: Partial<UserProfile>
) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    { ...patch, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
    { merge: true }
  );
}
