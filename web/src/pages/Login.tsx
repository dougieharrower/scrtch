import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  loginWithEmail,
  loginWithGoogle,
  signupWithEmail,
} from "../auth/authApi";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const from = (loc.state as { from?: string } | null)?.from ?? "/recipes";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (user) {
    nav(from, { replace: true });
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") await signupWithEmail(email, pw);
      else await loginWithEmail(email, pw);

      nav(from, { replace: true });
    } catch (ex: unknown) {
      const msg = ex instanceof Error ? ex.message : "Sign-in failed";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setErr(null);
    setBusy(true);
    try {
      await loginWithGoogle();
      nav(from, { replace: true });
    } catch (ex: unknown) {
      const msg = ex instanceof Error ? ex.message : "Google sign-in failed";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Sign in</h1>

      <button
        onClick={google}
        disabled={busy}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #444",
          background: "#111",
          color: "inherit",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        Continue with Google
      </button>

      <div style={{ margin: "14px 0", opacity: 0.7, fontSize: 12 }}>or</div>

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #333",
            background: "transparent",
            color: "inherit",
          }}
        />

        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #333",
            background: "transparent",
            color: "inherit",
          }}
        />

        <button
          type="submit"
          disabled={busy || !email || pw.length < 6}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #444",
            background: "#1a1a1a",
            color: "inherit",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #444",
            background: "transparent",
            color: "inherit",
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {mode === "signup"
            ? "Have an account? Sign in"
            : "New here? Create account"}
        </button>
      </form>

      {err && <div style={{ marginTop: 12, color: "tomato" }}>{err}</div>}
      <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>
        Passwords must be at least 6 characters.
      </div>
    </div>
  );
}
