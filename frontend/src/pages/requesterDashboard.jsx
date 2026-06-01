import { useState, useEffect } from "react";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"; // from .env file or default to ""
import "../styles/requesterDashboard.css";
const statusColors = {
  Pending:  { bg: "rgba(234,179,8,0.12)",  text: "#fbbf24", dot: "#f59e0b" },
  Approved: { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", dot: "#22c55e" },
  Rejected: { bg: "rgba(239,68,68,0.12)",  text: "#f87171", dot: "#ef4444" },
};

function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: c.bg, color: c.text,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function NewRequestModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    item_name: "", quantity: "", price_per_unit: "", budget_code: "", reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Purchase Request</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Item Name</label>
              <input className="field-input" placeholder="e.g. Laptop" required
                value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} />
            </div>
            <div className="field-group">
              <label className="field-label">Budget Code</label>
              <input className="field-input" placeholder="e.g. IT-2024-001" required
                value={form.budget_code} onChange={e => setForm({ ...form, budget_code: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Quantity</label>
              <input className="field-input" type="number" min="1" placeholder="1" required
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="field-group">
              <label className="field-label">Price per Unit ($)</label>
              <input className="field-input" type="number" min="0" step="0.01" placeholder="0.00" required
                value={form.price_per_unit} onChange={e => setForm({ ...form, price_per_unit: e.target.value })} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Reason</label>
            <textarea className="field-input field-textarea" placeholder="Why is this purchase needed?" required
              value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RequesterDashboard({ token, user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/request/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [token]);

  const handleSubmit = async (form) => {
    const res = await fetch(`${SERVER_URL}/request`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create request");
    fetchRequests();
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "Pending").length,
    approved: requests.filter(r => r.status === "Approved").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
  };

  const totalValue = requests.reduce((sum, r) => sum + (r.quantity * r.price_per_unit), 0);

  return (
    <div className="dash-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">ProcureFlow</span>
        </div>
        <nav className="sidebar-nav">
          <a className="nav-item nav-active" href="#">
            <span className="nav-icon">▦</span> Dashboard
          </a>
          <a className="nav-item" href="#" onClick={() => setShowModal(true)}>
            <span className="nav-icon">＋</span> New Request
          </a>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || "U"}</div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">{user?.department}</div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-title">My Requests</h1>
            <p className="dash-sub">Track and manage your purchase requests</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <span>＋</span> New Request
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: "Total Requests", value: stats.total, accent: "#6366f1" },
            { label: "Pending Review", value: stats.pending, accent: "#f59e0b" },
            { label: "Approved", value: stats.approved, accent: "#22c55e" },
            { label: "Total Value", value: `$${totalValue.toLocaleString()}`, accent: "#8b5cf6" },
          ].map((s) => (
            <div className="stat-card" key={s.label} style={{ "--accent": s.accent }}>
              <div className="stat-value" style={{ color: s.accent }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-header">
            <h2 className="table-title">Request History</h2>
          </div>
          {loading ? (
            <div className="table-empty">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">◈</div>
              <p>No requests yet. Create your first one!</p>
            </div>
          ) : (
            <table className="req-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Budget Code</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="td-item">{r.item_name}</td>
                    <td>{r.quantity}</td>
                    <td>${Number(r.price_per_unit).toLocaleString()}</td>
                    <td className="td-total">${(r.quantity * r.price_per_unit).toLocaleString()}</td>
                    <td><span className="budget-tag">{r.budget_code}</span></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="td-date">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showModal && <NewRequestModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
    </div>
  );
}