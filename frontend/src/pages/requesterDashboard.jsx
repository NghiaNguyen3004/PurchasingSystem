import { useState, useEffect } from "react";
import "../styles/requesterDashboard.css";
import "../styles/filterModal.css";
import { getMyRequests, submitRequest} from "../services/api.js";
import NewRequestModal from "../utils/NewRequestModal.jsx";
import FiltersModal from "../utils/FiltersModal.jsx";
import StatusBadge from "../components/statusBadge.jsx";

export default function RequesterDashboard({ token, user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({ 
    status: "All", 
    dateFrom: "",
    dateTo:"", 
  });

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

  const filteredRequests = requests.filter(r => {
      const statusMatch = filters.status === "All" || r.status === filters.status

      const created = new Date(r.created_at)
      const from = filters.dateFrom ? new Date(filters.dateFrom) : null
      const to = filters.dateTo ? new Date(filters.dateTo) : null

      const dateMatch =
        (!from || created >= from) &&
        (!to || created <= to)

      return statusMatch && dateMatch
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "Pending").length,
    approved: requests.filter(r => r.status === "Approved").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
    totalValue: requests.reduce((sum, r) => sum + (r.quantity * r.price_per_unit), 0)
  };




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
          <h1 className="dash-title">My Requests</h1>
          <div className="topbar-actions">
            <button className="btn-filter" onClick={() => setShowFilter(true)}>
              ⚙ Filter
              {/* show a dot if any filter is active */}
              {(filters.status !== "All" || filters.dateFrom || filters.dateTo) && (
                <span className="filter-dot" />
              )}
            </button>

            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <span>＋</span> New Request
            </button>
          </div>
          
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: "Total Requests", value: stats.total, accent: "#6366f1" },
            { label: "Pending Review", value: stats.pending, accent: "#f59e0b" },
            { label: "Approved", value: stats.approved, accent: "#22c55e" },
            { label: "Rejected", value: stats.rejected, accent: "#ef4444" },
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
                {filteredRequests.map((r) => (
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
      {showFilter && <FiltersModal filters={filters} onApply={setFilters} onClose={() => setShowFilter(false)}/>}
    </div>
  );
}