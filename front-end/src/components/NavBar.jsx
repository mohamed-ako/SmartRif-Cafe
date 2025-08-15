import React from "react";


export default function NavBar() {
  const role = localStorage.getItem("role") || "";
  const name = localStorage.getItem("name") || "User";

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">☕ Coffee POS</div>
      <div className="navbar-links">
        <span className="navbar-user">{name} ({role})</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
