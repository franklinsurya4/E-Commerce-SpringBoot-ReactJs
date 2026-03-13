import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../api/api"; 
import "../styles/auth.css";

function Signin() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Calls POST http://localhost:8080/auth/signin
      // Sends { username, email, password } → saves user to DB
      await signupUser({ username: name, email, password });

      alert("Signup successful! Please log in.");
      navigate("/login");

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>

        <h2>Sign Up</h2>

        {error && (
          <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "8px" }}>
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </form>
    </div>
  );
}

export default Signin;