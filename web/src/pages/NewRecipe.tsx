import { Link } from "react-router-dom";

export default function NewRecipe() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link to="/recipes" style={{ textDecoration: "none" }}>
        ← Back
      </Link>

      <h1 style={{ marginTop: 14 }}>New Recipe</h1>
      <p style={{ opacity: 0.75 }}>
        For now this is a placeholder. Next we’ll add a super friendly “recipe
        scratchpad” editor.
      </p>

      <div
        style={{
          marginTop: 14,
          border: "1px solid #333",
          borderRadius: 16,
          padding: 14,
        }}
      >
        <div style={{ fontWeight: 700 }}>Planned creation flow (v0)</div>
        <ul style={{ marginTop: 10 }}>
          <li>Title + visibility (Private / Unlisted / Public)</li>
          <li>Ingredients with “carton size?” notes</li>
          <li>Steps as checkable cards</li>
          <li>Optional timers suggested per step</li>
          <li>Save as draft immediately (no losing work)</li>
        </ul>
      </div>
    </div>
  );
}
