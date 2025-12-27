import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getUserProfile, upsertUserProfile } from "../data/userProfileStore";

export default function Profile() {
  const auth = useAuth();
  const { user, loading } = auth;

  const [screenName, setScreenName] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [busy, setBusy] = useState(false);

  // Load profile
  useEffect(() => {
    let cancelled = false;

    if (!user) return;

    const uid = user.uid;

    async function load() {
      const profile = await getUserProfile(uid);
      if (cancelled) return;

      setScreenName(profile?.screenName ?? "");
      setTheme(profile?.theme ?? "dark");
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Apply theme immediately
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("scrtch_theme", theme);
  }, [theme]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 user is GUARANTEED non-null below this line
  const uid = user.uid;

  async function save() {
    setBusy(true);
    try {
      await upsertUserProfile(uid, { screenName, theme });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Profile</h1>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Screen name</div>
          <input
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            placeholder="e.g. Dougie"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #333",
              background: "transparent",
              color: "inherit",
            }}
          />
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
            This will show as the author on forks you create (later).
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Theme</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setTheme("dark")}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid #444",
                background: theme === "dark" ? "#1a1a1a" : "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid #444",
                background: theme === "light" ? "#1a1a1a" : "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Light
            </button>
          </div>
        </div>

        <button
          onClick={save}
          disabled={busy}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #444",
            background: "#1a1a1a",
            color: "inherit",
            cursor: busy ? "not-allowed" : "pointer",
            width: "fit-content",
          }}
        >
          {busy ? "Saving…" : "Save changes"}
        </button>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Signed in as: {user.email ?? user.uid}
        </div>
      </div>
    </div>
  );
}
