import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

/* ── shared styles ───────────────────────────────── */
const S = {
  page: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "var(--bg-primary)",
    overflow: "hidden",
  },
  /* Left decorative panel */
  panel: (role) => ({
    width: "42%",
    background: role === "admin"
      ? "linear-gradient(145deg, #2d5a3d 0%, #4a7c59 55%, #6aab7a 100%)"
      : "linear-gradient(145deg, #4a7c59 0%, #6aab7a 55%, #8db49a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 40px",
    flexShrink: 0,
    transition: "background 0.5s ease",
    height: "100vh",
    overflow: "hidden",
  }),
  panelContent: {
    maxWidth: 340,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  panelEmoji: { fontSize: 36, marginBottom: 0 },
  panelTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 0,
  },
  panelDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.6,
    marginBottom: 0,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  featureItem: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 13.5,
    fontWeight: 500,
    backdropFilter: "blur(4px)",
  },
  /* Right form side */
  formSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 24px",
    height: "100vh",
    overflowY: "auto",
  },
  formCard: {
    width: "100%",
    maxWidth: 400,
  },
  formHeader: {
    textAlign: "center",
    marginBottom: 0,
  },
  formIcon: {
    fontSize: 32,
    marginBottom: 8,
    display: "block",
  },
  formTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: 4,
  },
  formSub: {
    fontSize: 13,
    color: "var(--text-muted)",
  },
  /* Tab switcher */
  tabWrap: {
    display: "flex",
    background: "var(--bg-secondary)",
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  tab: (active) => ({
    flex: 1,
    padding: "8px 0",
    textAlign: "center",
    fontSize: 13.5,
    fontWeight: active ? 600 : 500,
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    background: active ? "var(--bg-card)" : "transparent",
    borderRadius: 10,
    cursor: "pointer",
    border: "none",
    fontFamily: "'Inter', sans-serif",
    boxShadow: active ? "var(--shadow-xs)" : "none",
    transition: "all 0.2s",
  }),
  /* Role chips */
  roleWrap: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
  },
  roleChip: (active, color) => ({
    flex: 1,
    padding: "8px 0",
    textAlign: "center",
    fontSize: 13.5,
    fontWeight: active ? 600 : 500,
    borderRadius: 10,
    cursor: "pointer",
    border: active ? `2px solid ${color}` : "1.5px solid var(--border-soft)",
    background: active ? "var(--accent-green-soft)" : "var(--bg-card)",
    color: active ? "var(--accent-green)" : "var(--text-muted)",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.18s",
  }),
  /* Error / success box */
  alertBox: (type) => ({
    background: type === "error" ? "var(--accent-rose-soft)" : "var(--accent-green-soft)",
    border: `1.5px solid ${type === "error" ? "var(--accent-rose)" : "var(--accent-green)"}`,
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 13,
    color: type === "error" ? "var(--accent-rose)" : "var(--accent-green)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  }),
  formGroup: { marginBottom: 12 },
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: 5,
    letterSpacing: "0.01em",
  },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "9px 12px 9px 36px",
    border: "1.5px solid var(--border-soft)",
    borderRadius: 10,
    fontSize: 13.5,
    fontFamily: "'Inter', sans-serif",
    color: "var(--text-primary)",
    background: "var(--bg-card)",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    padding: 4,
  },
  submitBtn: (color) => ({
    width: "100%",
    padding: "10px",
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14.5,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.02em",
    transition: "all 0.2s",
    marginTop: 4,
    cursor: "pointer",
  }),
  switchText: {
    textAlign: "center",
    fontSize: 12.5,
    color: "var(--text-muted)",
    marginTop: 14,
  },
  switchLink: (color) => ({
    color,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    marginLeft: 4,
  }),
};

const PANEL_DATA = {
  admin: {
    emoji: "🛡️",
    title: "Admin Portal",
    desc: "Manage your entire store — products, inventory, orders, and revenue from one powerful dashboard.",
    features: ["📦 Full Product Management", "📊 Revenue Analytics", "📋 All Orders Access"],
    color: "#4a7c59",
    gradient: "linear-gradient(135deg, #4a7c59, #6aab7a)",
  },
  customer: {
    emoji: "🛍️",
    title: "Shop with FreshMart",
    desc: "Browse fresh groceries, place orders instantly, and track everything in one beautiful place.",
    features: ["🥦 Browse Fresh Products", "🛒 Easy Cart & Checkout", "📋 Track Your Orders"],
    color: "#4a7c59",
    gradient: "linear-gradient(135deg, #4a7c59, #8db49a)",
  },
};

export default function AuthPage() {
  const [tab, setTab] = useState("login");   // "login" | "signup"
  const [role, setRole] = useState("customer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { msg, type }

  const navigate = useNavigate();
  const panelInfo = PANEL_DATA[role];

  const resetForm = () => {
    setUsername(""); setPassword(""); setConfirm(""); setAlert(null);
  };

  const switchTab = (t) => { setTab(t); resetForm(); };

  const saveSession = (data) => {
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("role", data.role);
    sessionStorage.setItem("username", data.username);
  };

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert(null); setLoading(true);
    try {
      const res = await API.post("/login", { username, password });
      saveSession(res.data);
      navigate(res.data.role === "admin" ? "/" : "/shop");
    } catch (err) {
      setAlert({ msg: err.response?.data?.message || "Invalid credentials", type: "error" });
    } finally { setLoading(false); }
  };

  /* ── Signup ── */
  const handleSignup = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (password !== confirm) {
      setAlert({ msg: "Passwords do not match", type: "error" }); return;
    }
    if (password.length < 4) {
      setAlert({ msg: "Password must be at least 4 characters", type: "error" }); return;
    }
    setLoading(true);
    try {
      const res = await API.post("/signup", { username, password, role });
      setAlert({ msg: "Account created! Signing you in…", type: "success" });
      setTimeout(() => {
        saveSession(res.data);
        navigate(role === "admin" ? "/" : "/shop");
      }, 800);
    } catch (err) {
      setAlert({ msg: err.response?.data?.message || "Signup failed", type: "error" });
    } finally { setLoading(false); }
  };

  const accentColor = "#4a7c59";

  return (
    <div style={S.page}>
      {/* Left Panel */}
      <div style={S.panel(role)}>
        <div style={S.panelContent}>
          <div style={S.panelEmoji}>{panelInfo.emoji}</div>
          <h1 style={S.panelTitle}>{panelInfo.title}</h1>
          <p style={S.panelDesc}>{panelInfo.desc}</p>
          <div style={S.featureList}>
            {panelInfo.features.map((f) => (
              <div key={f} style={S.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div style={S.formSide}>
        <div style={S.formCard}>
          <div style={S.formHeader}>
            <span style={S.formIcon}>🛒</span>
            <h2 style={S.formTitle}>FreshMart</h2>
            <p style={S.formSub}>Grocery Store Management</p>
          </div>

          {/* Tab Switcher */}
          <div style={S.tabWrap}>
            <button style={S.tab(tab === "login")} onClick={() => switchTab("login")}>Sign In</button>
            <button style={S.tab(tab === "signup")} onClick={() => switchTab("signup")}>Create Account</button>
          </div>

          {/* Alert */}
          {alert && (
            <div style={S.alertBox(alert.type)}>
              <span>{alert.type === "error" ? "⚠️" : "✅"}</span>
              {alert.msg}
            </div>
          )}

          {/* Role Selector — always visible */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ ...S.label, marginBottom: 10 }}>I am a…</div>
            <div style={S.roleWrap}>
              <button
                style={S.roleChip(role === "customer", "#4a7c59")}
                onClick={() => setRole("customer")}
                type="button"
              >
                🛍️ Customer
              </button>
              <button
                style={S.roleChip(role === "admin", "#4a7c59")}
                onClick={() => setRole("admin")}
                type="button"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={tab === "login" ? handleLogin : handleSignup}>
            <div style={S.formGroup}>
              <label style={S.label}>Username</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>👤</span>
                <input
                  id="auth-username"
                  type="text"
                  style={S.input}
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Password</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>🔒</span>
                <input
                  id="auth-password"
                  type={showPass ? "text" : "password"}
                  style={{ ...S.input, paddingRight: 40 }}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />
                <button type="button" style={S.eyeBtn} onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {tab === "signup" && (
              <div style={S.formGroup}>
                <label style={S.label}>Confirm Password</label>
                <div style={S.inputWrap}>
                  <span style={S.inputIcon}>🔒</span>
                  <input
                    id="auth-confirm"
                    type={showPass ? "text" : "password"}
                    style={S.input}
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              style={{
                ...S.submitBtn(panelInfo.gradient),
                opacity: loading ? 0.72 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? (tab === "login" ? "Signing in…" : "Creating account…")
                : (tab === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>

          <p style={S.switchText}>
            {tab === "login" ? "Don't have an account?" : "Already have an account?"}
            <span
              style={S.switchLink(accentColor)}
              onClick={() => switchTab(tab === "login" ? "signup" : "login")}
            >
              {tab === "login" ? "Create one" : "Sign in"}
            </span>
          </p>

          {tab === "login" && (
            <p style={{ ...S.switchText, fontSize: 11.5, marginTop: 10, color: "var(--text-muted)" }}>
              Demo admin: <strong>eula31</strong> / <strong>kittu</strong> &nbsp;|&nbsp;
              Demo customer: <strong>customer1</strong> / <strong>customer123</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
