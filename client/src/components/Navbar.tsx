import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../api/config";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        STORE<span className="navbar-brand-dot">.</span>
      </Link>
      <nav className="navbar-links" aria-label="Main navigation">
        <NavLink to="/" end>
          Products
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/cart">Cart</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          </>
        )}
        <a href={`${API_BASE_URL}/api-docs`} target="_blank" rel="noreferrer">
          API Docs
        </a>
      </nav>
      <div className="navbar-auth">
        {isAuthenticated ? (
          <>
            <span className="navbar-user">
              {user?.name}
              {isAdmin && <span className="navbar-role">admin</span>}
            </span>
            <button type="button" className="btn btn-outline" onClick={() => void logout()}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}