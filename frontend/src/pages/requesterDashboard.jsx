import { useState, useEffect } from "react";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"; // from .env file or default to ""
import "../styles/requesterDashboard.css";
import { getMyRequests, submitRequest} from "../services/api.js";
import NewRequestModal from "../utils/NewRequestModal.jsx";

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

export default function RequesterDashboard({ token, user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getMyRequests(token);
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [token]);

  const handleSubmit = async (form) => {
    const res = await submitRequest(token, form);
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