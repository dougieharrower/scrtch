import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRecipes } from "../data/recipesStore";
import { useAuth } from "../auth/useAuth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

type FilterMode = "all" | "mine";

export default function RecipesList() {
  const allRecipes = getRecipes();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterMode>("all");

  function goLogin() {
    navigate("/login", { state: { from: "/recipes" } });
  }

  async function doLogout() {
    await signOut(auth);
    navigate("/recipes");
  }

  const recipes = useMemo(() => {
    if (filter === "all") return allRecipes;
    if (!user) return allRecipes;

    // Exact owner filter now that Recipe carries ownerId
    return allRecipes.filter((r) => r.ownerId === user.uid);
  }, [allRecipes, filter, user]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "1px solid #222",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/recipes" style={{ textDecoration: "none" }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>Scrtch</div>
          </Link>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Recipes • forks • make mode
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!loading && user ? (
            <>
              <Link
                to="/me/book"
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  textDecoration: "none",
                }}
              >
                ★ My Recipe Book
              </Link>

              <Link
                to="/profile"
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  textDecoration: "none",
                  opacity: 0.95,
                }}
              >
                Profile
              </Link>

              <button
                onClick={doLogout}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  background: "#1a1a1a",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <button
              onClick={goLogin}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid #444",
                background: "#1a1a1a",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          )}

          <Link
            to="/recipes/new"
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #444",
              textDecoration: "none",
            }}
          >
            + New recipe
          </Link>
        </div>
      </div>

      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Browse recipes and jump into Make Mode. Save or fork to build your own
        recipe book.
      </p>

      {/* Filter row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid #444",
            background: filter === "all" ? "#1a1a1a" : "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          All
        </button>

        {!loading && user ? (
          <button
            onClick={() => setFilter("mine")}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #444",
              background: filter === "mine" ? "#1a1a1a" : "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Mine
          </button>
        ) : null}
      </div>

      {!loading && !user && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid #333",
            borderRadius: 14,
            background: "#111",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ opacity: 0.85 }}>
            Want to save recipes or fork your own versions?
          </div>
          <button
            onClick={goLogin}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #444",
              background: "#1a1a1a",
              color: "inherit",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Sign in
          </button>
        </div>
      )}

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

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Badge text={r.visibility.toUpperCase()} />
                  {r.parentId ? <Badge text="FORK" /> : null}
                  <span style={{ fontSize: 12, opacity: 0.75 }}>
                    • {r.servingsDefault} servings
                  </span>
                </div>

                {r.tags?.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {r.tags.slice(0, 6).map((t) => (
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

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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

        {recipes.length === 0 && (
          <div style={{ opacity: 0.75, padding: 12 }}>
            {filter === "mine"
              ? "No recipes of yours yet. Create a recipe or fork one to get started."
              : "No recipes yet. Add one (or import sample data) to get started."}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        border: "1px solid #444",
        padding: "3px 8px",
        borderRadius: 999,
        fontSize: 11,
        opacity: 0.9,
        letterSpacing: 0.3,
      }}
    >
      {text}
    </span>
  );
}
