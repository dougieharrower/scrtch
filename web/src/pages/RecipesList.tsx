import { Link } from "react-router-dom";
import { getRecipes } from "../data/recipesStore";

export default function RecipesList() {
  const recipes = getRecipes();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Scrtch</h1>

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

      <p style={{ opacity: 0.75, marginTop: 8 }}>
        Your recipe repos — forks included.
      </p>

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

                {r.tags?.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
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
      </div>
    </div>
  );
}
