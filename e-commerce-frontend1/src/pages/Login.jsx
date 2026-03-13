import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/api"; 
import "../styles/auth.css";

function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Calls your real Spring Boot backend: POST /auth/login
      // Returns { token: "eyJhbGci..." } on success
      //         { error: "Invalid Credentials" } on failure
      const res = await loginUser({ email, password });

      if (res.data.token) {
        // ✅ Save the real JWT — this is what /auth/me reads
        login(res.data.token);
        navigate("/");
      } else {
        setError(res.data.error || "Invalid email or password");
      }

    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>

        <h2>Login</h2>

        {error && (
          <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "8px" }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?
          <Link to="/signup"> Sign Up</Link>
        </p>

      </form>
    </div>
  );
}

export default Login;