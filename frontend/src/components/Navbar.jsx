import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Grocery Store
        </Link>

        <div className="navbar-nav">
          <Link className="nav-link" to="/">
            Dashboard
          </Link>

          <Link className="nav-link" to="/products">
            Products
          </Link>

          <li className="nav-item">
  <Link
    className="nav-link"
    to="/order-history"
  >
    Order History
  </Link>
</li>

          <Link className="nav-link" to="/orders">
            Orders
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;