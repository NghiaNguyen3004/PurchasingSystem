import { useState } from "react";
import "../styles/login.css";
import { LoginUser } from "../services/api.js";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"; // from .env file or default to ""
const roles = ["Requester", "Approver"];

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState("Requester");
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (username, password) => {
    setLoading(true);
    setError("");
    try {
      const data = await LoginUser(username, password);
      console.log("Login successful:", data.token);
      onLogin(data.token, activeTab);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">⬡</span>
          </div>
          <h1 className="login-title">ProcureFlow</h1>
          <p className="login-subtitle">Internal Procurement System</p>
        </div>

        <div className="tab-bar">
          {roles.map((role) => (
            <button
              key={role}
              className={`tab-btn ${activeTab === role ? "tab-active" : ""}`}
              onClick={() => { setActiveTab(role); setError(""); }}
            >
              <span className="tab-icon">{role === "Requester" ? "◈" : "◉"}</span>
              {role}
            </button>
          ))}
        </div>

        <form className="login-form" onSubmit={(e) => handleSubmit(form.username, form.password)}>
          <div className="field-group">
            <label className="field-label">Username</label>
            <input
              className="field-input"
              type="text"
              placeholder={`Enter your username`}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              `Sign in as ${activeTab}`
            )}
          </button>
        </form>

        <p className="login-footer">
          Signing in as <strong>{activeTab}</strong> — contact IT to change your role
        </p>
      </div>
    </div>
  );
}