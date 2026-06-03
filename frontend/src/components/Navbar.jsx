
import { Link } from "react-router-dom";

function Navbar({darkMode, setDarkMode}) {

  const username =
  sessionStorage.getItem("username");

  const logout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const token = sessionStorage.getItem("token");

  if (!token) return null;

  return (
<nav
  className="navbar navbar-expand-lg navbar-dark shadow"
  style={{
    background:
      "linear-gradient(135deg, #0f172a, #1e3a8a)",
  }}
>      <div className="container">

        <Link className="navbar-brand fw-bold" to="/">
          🛒 Grocery Store
        </Link>

        <div className="navbar-nav ms-auto">

          <Link className="nav-link" to="/">
            Dashboard
          </Link>

          <Link className="nav-link" to="/products">
            Products
          </Link>

          <Link className="nav-link" to="/orders">
            Orders
          </Link>

          <Link className="nav-link" to="/order-history">
            Order History
          </Link>
          <div className="d-flex align-items-center">

          <span className="text-white me-3">
  Welcome, {username}
</span>

<button
  className="btn btn-outline-light ms-3"
  onClick={() => setDarkMode(!darkMode)}
>
  {darkMode ? "Light Mode" : "Dark Mode"}
</button>
                
          {token && (
  <button
    className="btn btn-light ms-3"
    onClick={logout}
  >
    Logout
  </button>
  
)}
</div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;