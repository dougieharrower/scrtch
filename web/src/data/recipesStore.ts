import type { Unsubscribe } from "firebase/firestore";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db, auth } from "../firebase";
import type { Recipe } from "./sampleRecipes";
import { sampleRecipes } from "./sampleRecipes";

/**
 * Local in-memory cache fed by Firestore.
 * UI reads synchronously via getRecipes()/getRecipeById().
 */
let recipes: Recipe[] = [...sampleRecipes];
let unsubPublic: Unsubscribe | null = null;
let unsubMine: Unsubscribe | null = null;

type RecipesListenerOpts = {
  includeMyRecipes?: boolean; // defaults true
};

/**
 * Subscribe to public recipes (and optionally "my recipes") and keep local cache in sync.
 * Call once on app start (e.g., in main.tsx).
 */
export function startRecipesListener(opts: RecipesListenerOpts = {}) {
  const includeMyRecipes = opts.includeMyRecipes ?? true;

  if (!unsubPublic) {
    const qPublic = query(
      collection(db, "recipes"),
      where("visibility", "==", "public"),
      orderBy("updatedAt", "desc")
    );

    unsubPublic = onSnapshot(
      qPublic,
      (snap) => {
        const incoming = snap.docs
          .map((d) => fromDoc(d.id, d.data() as FirestoreRecipeDoc))
          .filter((r) => Boolean(r?.id && r?.title)) as Recipe[];

        recipes = mergeById(recipes, incoming);
      },
      (err) => console.error("Firestore public recipes listener error:", err)
    );
  }

  if (includeMyRecipes && !unsubMine) {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const qMine = query(
        collection(db, "recipes"),
        where("ownerId", "==", uid),
        orderBy("updatedAt", "desc")
      );

      unsubMine = onSnapshot(
        qMine,
        (snap) => {
          const incoming = snap.docs
            .map((d) => fromDoc(d.id, d.data() as FirestoreRecipeDoc))
            .filter((r) => Boolean(r?.id && r?.title)) as Recipe[];

          recipes = mergeById(recipes, incoming);
        },
        (err) => console.error("Firestore my recipes listener error:", err)
      );
    }
  }
}

/** Optional: stop listeners (handy for tests) */
export function stopRecipesListener() {
  if (unsubPublic) {
    unsubPublic();
    unsubPublic = null;
  }
  if (unsubMine) {
    unsubMine();
    unsubMine = null;
  }
}

export function getRecipes() {
  return recipes;
}

/** Sync cache lookup */
export function getRecipeById(id: string) {
  return recipes.find((r) => r.id === id);
}

/**
 * Fetch directly from Firestore (for deep links / cache misses).
 * Returns null if not found.
 */
export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  const snap = await getDoc(doc(db, "recipes", id));
  if (!snap.exists()) return null;

  const r = fromDoc(snap.id, snap.data() as FirestoreRecipeDoc);
  if (!r) return null;

  recipes = upsertInCache(recipes, r);
  return r;
}

/**
 * Create a recipe in Firestore.
 * Returns the created document id.
 */
export async function addRecipe(r: Recipe): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to create a recipe.");

  const ref = doc(db, "recipes", r.id);

  const payload: FirestoreRecipeDoc = stripUndefined({
    title: r.title,
    description: r.description,
    steps: r.steps,
    ingredients: r.ingredients,
    tags: r.tags ?? [],
    visibility: r.visibility,
    servingsDefault: r.servingsDefault,

    parentId: r.parentId,
    rootId: r.rootId,
    forkReason: r.forkReason,
    authorName: r.authorName,

    ownerId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(ref, payload, { merge: false });

  // optimistic cache update (listener will also reconcile)
  recipes = upsertInCache(recipes, r);

  return r.id;
}

/**
 * Update an existing recipe in Firestore.
 * Rules should ensure only owner can update.
 */
export async function updateRecipe(updated: Recipe): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to update a recipe.");

  const ref = doc(db, "recipes", updated.id);

  const patch: Partial<FirestoreRecipeDoc> = stripUndefined({
    title: updated.title,
    description: updated.description,
    steps: updated.steps,
    ingredients: updated.ingredients,
    tags: updated.tags ?? [],
    visibility: updated.visibility,
    servingsDefault: updated.servingsDefault,

    parentId: updated.parentId,
    rootId: updated.rootId,
    forkReason: updated.forkReason,
    authorName: updated.authorName,

    updatedAt: serverTimestamp(),
  });

  await updateDoc(ref, patch as Record<string, unknown>);

  recipes = upsertInCache(recipes, updated);
}

/**
 * Given ANY recipe, return the root/original recipe (if we have it in cache).
 */
export function getRootRecipe(recipe: Recipe) {
  const rootId = recipe.rootId ?? recipe.id;
  return getRecipeById(rootId);
}

/* -------------------- helpers + types -------------------- */

type FirestoreRecipeDoc = {
  title: string;
  description?: string;
  steps: Recipe["steps"];
  ingredients: Recipe["ingredients"];
  tags: string[];
  visibility: Recipe["visibility"];
  servingsDefault: number;

  parentId?: string;
  rootId?: string;
  forkReason?: string;
  authorName?: string;

  ownerId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function fromDoc(id: string, data: FirestoreRecipeDoc): Recipe | null {
  if (!data?.title || !data?.visibility || !data?.servingsDefault) return null;

  return {
    id,
    title: data.title,
    description: data.description,
    steps: data.steps ?? [],
    ingredients: data.ingredients ?? [],
    tags: data.tags ?? [],
    visibility: data.visibility,
    servingsDefault: data.servingsDefault,

    parentId: data.parentId,
    rootId: data.rootId,
    forkReason: data.forkReason,
    authorName: data.authorName,
  };
}

function upsertInCache(list: Recipe[], r: Recipe): Recipe[] {
  const idx = list.findIndex((x) => x.id === r.id);
  if (idx === -1) return [r, ...list];
  const copy = [...list];
  copy[idx] = r;
  return copy;
}

function mergeById(existing: Recipe[], incoming: Recipe[]): Recipe[] {
  const map = new Map<string, Recipe>();
  for (const r of existing) map.set(r.id, r);
  for (const r of incoming) map.set(r.id, r);
  return Array.from(map.values());
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}
