import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="state-box">
      <p className="state-title">404 — Page not found</p>
      <p className="state-message">The page you are looking for does not exist.</p>
      <Link to="/" className="btn">
        Back to products
      </Link>
    </div>
  );
}