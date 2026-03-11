import { NavLink } from "react-router-dom";
import { useState } from "react";
import "../styles/navbar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBox,
  faList,
  faGear,
  faUser,
  faCartShopping,
  faRightToBracket,
  faMedal
} from "@fortawesome/free-solid-svg-icons";

function Navbar({ darkMode, toggleTheme }) {

  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);
  };

  return (
    <nav className={darkMode ? "navbar navbar-dark" : "navbar"}>

      {/* LEFT */}
      <div className="nav-left">

        <h2 className="logo">
          <FontAwesomeIcon icon={faMedal} className="logo-icon"/>
          QualityProducts
        </h2>

        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

      </div>

      {/* RIGHT */}
      <div className="nav-right">

        <NavLink to="/" end>
          <FontAwesomeIcon icon={faHouse}/> Home
        </NavLink>

        <NavLink to="/orders">
          <FontAwesomeIcon icon={faBox} /> Orders
        </NavLink>

        <NavLink to="/categories">
          <FontAwesomeIcon icon={faList}/> Categories
        </NavLink>

        <NavLink to="/settings">
          <FontAwesomeIcon icon={faGear} /> Settings
        </NavLink>

        <NavLink to="/account">
          <FontAwesomeIcon icon={faUser}/> Account
        </NavLink>

        <NavLink to="/cart">
          <FontAwesomeIcon icon={faCartShopping}/> Cart
        </NavLink>

        <NavLink to="/login">
          <FontAwesomeIcon icon={faRightToBracket}/> Login/SignIn
        </NavLink>

       

      </div>

    </nav>
  );
}

export default Navbar;