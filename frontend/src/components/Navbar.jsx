import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { admin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <header className="navbar">
      <div className="navbar-brand">📧 Bulk Mailer</div>
      <nav className="navbar-links">
        <NavLink to="/send" className={({ isActive }) => (isActive ? "active" : "")}>
          Send Mail
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
          History
        </NavLink>
      </nav>
      <div className="navbar-user">
        <span>{admin?.email}</span>
        <button onClick={handleLogout} className="btn btn-ghost">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
