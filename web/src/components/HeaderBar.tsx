import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function HeaderBar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function goLogin() {
    navigate("/login", { state: { from: location.pathname } });
  }

  return (
    <header
      style={{
        borderBottom: "1px solid #333",
        background: "#0f0f0f",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Left: brand */}
        <Link
          to="/recipes"
          style={{
            fontWeight: 900,
            fontSize: 18,
            textDecoration: "none",
            letterSpacing: 0.3,
          }}
        >
          Scrtch
        </Link>

        {/* Right: nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/recipes"
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #444",
              textDecoration: "none",
              opacity: 0.95,
            }}
          >
            Browse
          </Link>

          {!loading && user && (
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
                ★ My Book
              </Link>

              <Link
                to="/profile"
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  textDecoration: "none",
                  opacity: 0.9,
                }}
              >
                Profile
              </Link>
            </>
          )}

          {!loading && !user && (
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
        </nav>
      </div>
    </header>
  );
}
