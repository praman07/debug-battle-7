import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { postApiUsersLogin } from "../api/api";
import { getApiErrorMessage } from "../utils/format";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await postApiUsersLogin({ body: { email, password } });
    setSubmitting(false);
    if (result.error) {
      setError(getApiErrorMessage(result.error, "Login failed"));
      return;
    }
    if (!result.data) {
      setError("The login response was empty");
      return;
    }
    login(result.data.data);
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-layout">
      <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
        <h1 className="page-title">Login</h1>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="form-hint">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}