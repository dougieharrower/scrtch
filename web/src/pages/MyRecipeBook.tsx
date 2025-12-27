import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { listenSavedRecipeIds } from "../data/savedRecipesStore";
import { fetchRecipeById, getRecipeById } from "../data/recipesStore";
import type { Recipe } from "../data/sampleRecipes";

export default function MyRecipeBook() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [ids, setIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!user) return;
    return listenSavedRecipeIds(user.uid, setIds);
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!user) return;
      setBusy(true);

      try {
        const out: Recipe[] = [];

        for (const id of ids) {
          // try cache first
          const cached = getRecipeById(id);
          if (cached) {
            out.push(cached);
            continue;
          }

          // fallback fetch
          const fetched = await fetchRecipeById(id);
          if (fetched) out.push(fetched);
        }

        if (!cancelled) setRecipes(out);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [ids, user]);

  const title = useMemo(() => `My Recipe Book (${ids.length})`, [ids.length]);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <p style={{ opacity: 0.75, marginTop: 8, marginBottom: 0 }}>
            Recipes you’ve saved. Forks you create are saved automatically.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/recipes"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #444",
              textDecoration: "none",
            }}
          >
            ← Browse
          </Link>

          <Link
            to="/recipes/new"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #444",
              textDecoration: "none",
            }}
          >
            + New recipe
          </Link>
        </div>
      </div>

      {busy ? (
        <div style={{ marginTop: 16, opacity: 0.8 }}>
          Loading saved recipes…
        </div>
      ) : recipes.length === 0 ? (
        <div style={{ marginTop: 16, opacity: 0.8 }}>
          Nothing saved yet. Go grab something tasty from{" "}
          <button
            onClick={() => navigate("/recipes")}
            style={{ cursor: "pointer" }}
          >
            the recipes list
          </button>
          .
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {recipes.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #333",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>
                    <Link
                      to={`/recipes/${r.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      {r.title}
                    </Link>
                  </div>

                  {r.description && (
                    <div style={{ marginTop: 6, opacity: 0.8 }}>
                      {r.description}
                    </div>
                  )}

                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                    {r.visibility.toUpperCase()} • {r.servingsDefault} servings
                    {r.parentId ? " • FORK" : ""}
                  </div>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <Link
                    to={`/recipes/${r.id}/make`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #444",
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    ▶ Make
                  </Link>

                  <Link
                    to={`/recipes/${r.id}`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #444",
                      textDecoration: "none",
                      textAlign: "center",
                      opacity: 0.9,
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
