import { NavLink } from "react-router-dom";
import "./Navbar.css"; // 👈 make sure this is imported

export default function Navbar() {
  return (
    <nav className="navbar">
      <h3 className="logo">ShopScale Fabric</h3>

      <div className="nav-links">
        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Cart
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Orders
        </NavLink>
      </div>
    </nav>
  );
}
