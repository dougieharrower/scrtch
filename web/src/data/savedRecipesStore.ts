import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

function savedDocRef(uid: string, recipeId: string) {
  return doc(db, "users", uid, "savedRecipes", recipeId);
}

function savedColRef(uid: string) {
  return collection(db, "users", uid, "savedRecipes");
}

/** Realtime: tells you whether a recipe is saved for a user */
export function listenIsRecipeSaved(
  uid: string,
  recipeId: string,
  cb: (isSaved: boolean) => void
): Unsubscribe {
  return onSnapshot(savedDocRef(uid, recipeId), (snap) => cb(snap.exists()));
}

/** Realtime: list of recipeIds saved to the user’s recipe book */
export function listenSavedRecipeIds(
  uid: string,
  cb: (recipeIds: string[]) => void
): Unsubscribe {
  const q = query(savedColRef(uid), orderBy("savedAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.id)));
}

/** Save/bookmark a recipe to the user's recipe book */
export async function saveRecipeToBook(uid: string, recipeId: string) {
  await setDoc(
    savedDocRef(uid, recipeId),
    { recipeId, savedAt: serverTimestamp() },
    { merge: true }
  );
}

/** Remove a recipe from the user's recipe book */
export async function unsaveRecipeFromBook(uid: string, recipeId: string) {
  await deleteDoc(savedDocRef(uid, recipeId));
}
