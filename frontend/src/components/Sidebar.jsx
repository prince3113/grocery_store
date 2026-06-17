import { NavLink, useNavigate } from "react-router-dom";
import "../sidebar.css";

const ADMIN_NAV = [
  { to: "/", icon: "📊", label: "Dashboard" },
  { to: "/products", icon: "🛍️", label: "Products" },
  { to: "/orders", icon: "🧾", label: "New Order" },
  { to: "/order-history", icon: "📋", label: "Order History" },
];

const CUSTOMER_NAV = [
  { to: "/shop", icon: "🛒", label: "Shop" },
  { to: "/my-orders", icon: "📋", label: "My Orders" },
];

function Sidebar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "User";
  const role = sessionStorage.getItem("role") || "customer";
  const token = sessionStorage.getItem("token");

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (!token) return null;

  const initials = username.slice(0, 2).toUpperCase();
  const navItems = role === "admin" ? ADMIN_NAV : CUSTOMER_NAV;

  /* Accent colour per role */
  const accentBg = role === "admin" ? "var(--accent-green-soft)" : "var(--accent-blue-soft)";
  const accentColor = role === "admin" ? "var(--accent-green)" : "var(--accent-blue)";

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: accentBg, color: accentColor }}>
          🛒
        </div>
        <div>
          <div className="sidebar-logo-text">FreshMart</div>
          <span className="sidebar-logo-sub">
            {role === "admin" ? "Admin Portal" : "Customer Store"}
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">
          {role === "admin" ? "Management" : "Shopping"}
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/" || item.to === "/shop"}
            className={({ isActive }) =>
              `nav-item${isActive ? " active" : ""}`
            }
            style={({ isActive }) =>
              isActive
                ? {
                  background: accentBg,
                  color: accentColor,
                }
                : {}
            }
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div
            className="sidebar-avatar"
            style={{ background: accentBg, color: accentColor }}
          >
            {initials}
          </div>
          <div>
            <div className="sidebar-user-name">{username}</div>
            <div className="sidebar-user-role" style={{ color: accentColor, fontWeight: 500 }}>
              {role === "admin" ? "🛡️ Admin" : "🛍️ Customer"}
            </div>
          </div>
          {/* Dark mode toggle */}
          <button
            className="theme-toggle"
            style={{ marginLeft: "auto" }}
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <button className="sidebar-logout-btn" onClick={logout}>
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
