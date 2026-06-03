import { useState } from "react"
import { useAuth } from "../context/authContext.jsx"
import { DEPARTMENTS } from "../constants/department.js"

import "../styles/adminDashboard.css"

const USER_TYPES = ["Requester", "Approver", "Admin"]

export default function AdminDashboard() {
  const { token, user, logout } = useAuth()
  const [form, setForm] = useState({
    username: "", password: "", user_type: "", department: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSuccess(`User "${data.user.username}" created successfully!`)
      setForm({ username: "", password: "", user_type: "", department: "" })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dash-root">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">ProcureFlow</span>
        </div>
        <nav className="sidebar-nav">
          <a className="nav-item nav-active" href="#">
            <span className="nav-icon">▦</span> User Management
          </a>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">Admin</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-title">User Management</h1>
            <p className="dash-sub">Register new users into the system</p>
          </div>
        </div>

        <div className="register-card">
          <h2 className="table-title" style={{ marginBottom: 20 }}>Register New User</h2>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Username</label>
                <input className="field-input" placeholder="e.g. john_doe" required
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="field-group">
                <label className="field-label">Password</label>
                <input className="field-input" type="password" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">User Type</label>
                <select className="field-input field-select" required
                  value={form.user_type} onChange={e => setForm({ ...form, user_type: e.target.value })}>
                  <option value="">Select type...</option>
                  {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Department</label>
                <select className="field-input field-select" required
                  value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && (
              <div className="form-success">{success}</div>
            )}

            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : "Register User"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}