import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { postApiUsersRegister } from "../api/api";
import { getApiErrorMessage } from "../utils/format";

export function RegisterPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [name, setName] = useState("");
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
    const result = await postApiUsersRegister({ body: { name, email, password } });
    setSubmitting(false);
    if (result.error) {
      setError(getApiErrorMessage(result.error, "Registration failed"));
      return;
    }
    if (!result.data) {
      setError("The registration response was empty");
      return;
    }
    login(result.data.data);
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-layout">
      <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
        <h1 className="page-title">Register</h1>
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
          />
        </label>
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
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <p className="form-hint">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}