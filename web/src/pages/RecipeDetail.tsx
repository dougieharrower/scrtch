import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  addRecipe,
  fetchRecipeById,
  getRecipeById,
  getRootRecipe,
} from "../data/recipesStore";
import { forkRecipe } from "../utils/fork";
import { useAuth } from "../auth/useAuth";
import {
  listenIsRecipeSaved,
  saveRecipeToBook,
  unsaveRecipeFromBook,
} from "../data/savedRecipesStore";
import type { Recipe } from "../data/sampleRecipes";

type ForkChoice = "branch" | "original";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [forkOpen, setForkOpen] = useState(false);
  const [forkChoice, setForkChoice] = useState<ForkChoice>("branch");
  const [forkReason, setForkReason] = useState(
    "Adjusted for my kitchen (timing/spice/preferences)."
  );
  const [isForking, setIsForking] = useState(false);

  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [rootRecipe, setRootRecipe] = useState<Recipe | undefined>(undefined);
  const [loadingRecipe, setLoadingRecipe] = useState(true);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const isFork = Boolean(recipe?.parentId);
  const canOfferOriginalChoice = Boolean(isFork && rootRecipe);

  function goToLogin() {
    navigate("/login", { state: { from: location.pathname } });
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setRecipe(undefined);
        setRootRecipe(undefined);
        setLoadingRecipe(false);
        return;
      }

      setLoadingRecipe(true);
      try {
        // 1) try cache first
        let r = getRecipeById(id);

        // 2) if missing, fetch
        if (!r) {
          const fetched = await fetchRecipeById(id);
          r = fetched ?? undefined;
        }

        if (cancelled) return;
        setRecipe(r);

        // root recipe
        if (r) {
          const rootId = r.rootId ?? r.id;
          let root = getRecipeById(rootId) ?? getRootRecipe(r);

          if (!root && rootId) {
            const fetchedRoot = await fetchRecipeById(rootId);
            root = fetchedRoot ?? undefined;
          }

          if (cancelled) return;
          setRootRecipe(root);
        } else {
          setRootRecipe(undefined);
        }
      } finally {
        if (!cancelled) setLoadingRecipe(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !recipe?.id) {
      setIsSaved(false);
      return;
    }
    return listenIsRecipeSaved(user.uid, recipe.id, setIsSaved);
  }, [user, recipe?.id]);

  const servingsLabel = useMemo(() => {
    if (!recipe) return "";
    return `${recipe.visibility.toUpperCase()} • ${
      recipe.servingsDefault
    } servings`;
  }, [recipe]);

  function openFork() {
    if (!user && !authLoading) {
      goToLogin();
      return;
    }
    setForkChoice("branch");
    setForkOpen(true);
  }

  async function toggleSave() {
    if (!recipe) return;
    if (!user && !authLoading) {
      goToLogin();
      return;
    }
    if (!user) return;

    if (saving) return;
    setSaving(true);

    try {
      if (isSaved) await unsaveRecipeFromBook(user.uid, recipe.id);
      else await saveRecipeToBook(user.uid, recipe.id);
    } finally {
      setSaving(false);
    }
  }

  async function createFork() {
    if (!recipe) return;

    if (!user && !authLoading) {
      setForkOpen(false);
      goToLogin();
      return;
    }
    if (!user) return;

    if (isForking) return;
    setIsForking(true);

    try {
      const fork =
        forkChoice === "original" && rootRecipe
          ? forkRecipe(recipe, {
              choice: "original",
              original: rootRecipe,
              overrides: { forkReason },
            })
          : forkRecipe(recipe, {
              choice: "branch",
              overrides: { forkReason },
            });

      const newId = await addRecipe(fork);

      // forks auto-save
      await saveRecipeToBook(user.uid, newId);

      setForkOpen(false);
      navigate(`/recipes/${newId}`);
    } finally {
      setIsForking(false);
    }
  }

  if (loadingRecipe) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <Link to="/recipes">← Back</Link>
        <p style={{ marginTop: 12, opacity: 0.8 }}>Loading…</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <p>Recipe not found.</p>
        <Link to="/recipes">← Back</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link to="/recipes">← Back</Link>

      <div style={{ marginTop: 12 }}>
        <h1 style={{ margin: 0 }}>{recipe.title}</h1>

        {recipe.description && (
          <p style={{ marginTop: 8, opacity: 0.8 }}>{recipe.description}</p>
        )}

        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
          {servingsLabel}
          {recipe.authorName ? ` • by ${recipe.authorName}` : ""}
          {isFork ? " • FORK" : ""}
          {recipe.rootId ? ` • root: ${recipe.rootId}` : ""}
        </div>

        {recipe.parentId && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #333",
              borderRadius: 14,
              background: "#111",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              Forked from:{" "}
              <Link to={`/recipes/${recipe.parentId}`}>{recipe.parentId}</Link>
            </div>

            {rootRecipe && recipe.rootId && recipe.rootId !== recipe.id && (
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                Root recipe:{" "}
                <Link to={`/recipes/${recipe.rootId}`}>{rootRecipe.title}</Link>
              </div>
            )}

            {recipe.forkReason && (
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                {recipe.forkReason}
              </div>
            )}
          </div>
        )}

        <div
          style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <Link
            to={`/recipes/${recipe.id}/make`}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #444",
              textDecoration: "none",
            }}
          >
            ▶ Make Mode
          </Link>

          <button
            onClick={toggleSave}
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #444",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
            title={user ? "" : "Sign in to save recipes"}
          >
            {isSaved ? "★ Saved" : "☆ Save to Recipe Book"}
          </button>

          <button
            onClick={openFork}
            disabled={isForking}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #444",
              cursor: isForking ? "not-allowed" : "pointer",
              opacity: isForking ? 0.6 : 1,
            }}
            title={user ? "" : "Sign in to fork recipes"}
          >
            🍴 Fork this recipe
          </button>

          {!user && !authLoading && (
            <div style={{ fontSize: 12, opacity: 0.75, alignSelf: "center" }}>
              Want to save/fork?{" "}
              <button onClick={goToLogin} style={{ cursor: "pointer" }}>
                Sign in
              </button>
            </div>
          )}
        </div>

        {recipe.tags?.length > 0 && (
          <div
            style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}
          >
            {recipe.tags.map((t) => (
              <span
                key={t}
                style={{
                  border: "1px solid #444",
                  padding: "4px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                  opacity: 0.85,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Ingredients</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {recipe.ingredients.map((ing, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #333",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {ing.amount !== undefined ? ing.amount : ""}{" "}
                {ing.unit ? ing.unit : ""} {ing.name}
              </div>
              {ing.note && (
                <div style={{ marginTop: 4, opacity: 0.8 }}>{ing.note}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Steps</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {recipe.steps.map((s, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #333",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 800 }}>Step {idx + 1}</div>
              <div style={{ marginTop: 6 }}>{s.text}</div>

              {s.timer && (
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                  ⏱ {s.timer.label} ({Math.round(s.timer.seconds / 60)} min)
                  {s.timer.kind === "in" ? " • start later" : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {forkOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 9999,
          }}
          onClick={() => !isForking && setForkOpen(false)}
        >
          <div
            style={{
              width: "min(620px, 100%)",
              border: "1px solid #333",
              borderRadius: 16,
              background: "#0f0f0f",
              padding: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Fork recipe</div>
                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  Create your own editable copy. The original stays unchanged.
                </div>
              </div>

              <button
                onClick={() => !isForking && setForkOpen(false)}
                style={{
                  border: "1px solid #444",
                  background: "transparent",
                  color: "inherit",
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: isForking ? "not-allowed" : "pointer",
                  opacity: isForking ? 0.6 : 1,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 700 }}>Fork from…</div>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  border: "1px solid #333",
                  borderRadius: 14,
                  padding: 12,
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="forkChoice"
                  value="branch"
                  checked={forkChoice === "branch"}
                  onChange={() => setForkChoice("branch")}
                  style={{ marginTop: 4 }}
                />
                <div>
                  <div style={{ fontWeight: 800 }}>This version</div>
                  <div style={{ opacity: 0.8, marginTop: 4 }}>
                    Fork exactly what you’re viewing (including any tweaks
                    already made).
                  </div>
                </div>
              </label>

              {canOfferOriginalChoice && (
                <label
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    border: "1px solid #333",
                    borderRadius: 14,
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="forkChoice"
                    value="original"
                    checked={forkChoice === "original"}
                    onChange={() => setForkChoice("original")}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      Original recipe{" "}
                      <span style={{ opacity: 0.8 }}>
                        ({rootRecipe?.title ?? recipe.rootId})
                      </span>
                    </div>
                    <div style={{ opacity: 0.8, marginTop: 4 }}>
                      Start from the clean base instead of inheriting this
                      branch’s changes.
                    </div>
                  </div>
                </label>
              )}

              <div style={{ marginTop: 4 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  What are you changing?
                </div>
                <textarea
                  value={forkReason}
                  onChange={(e) => setForkReason(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid #333",
                    background: "transparent",
                    color: "inherit",
                    padding: 10,
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
              >
                <button
                  onClick={() => setForkOpen(false)}
                  disabled={isForking}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #444",
                    cursor: isForking ? "not-allowed" : "pointer",
                    opacity: isForking ? 0.6 : 1,
                    background: "transparent",
                    color: "inherit",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={createFork}
                  disabled={isForking}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #444",
                    cursor: isForking ? "not-allowed" : "pointer",
                    opacity: isForking ? 0.6 : 1,
                    background: "#1a1a1a",
                    color: "inherit",
                  }}
                >
                  {isForking ? "Creating…" : "Create fork"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
