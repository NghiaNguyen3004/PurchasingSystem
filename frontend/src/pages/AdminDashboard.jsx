import { useState, useEffect } from "react"
import { useAuth } from "../context/authContext.jsx"
import { DEPARTMENTS } from "../constants/department.js"
import { getAllUsers, deleteUser, changeUserRole, registerUser } from "../services/api.js"
import "../styles/adminDashboard.css"

const USER_TYPES = ["Requester", "Approver", "Admin"]

const TYPE_COLORS = {
  Requester: { bg: "rgba(99,102,241,0.12)", text: "#818cf8" },
  Approver:  { bg: "rgba(34,197,94,0.12)",  text: "#4ade80" },
  Admin:     { bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
}

function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || TYPE_COLORS.Requester
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 500,
    }}>
      {type}
    </span>
  )
}

export default function AdminDashboard() {
  const { token, user, logout } = useAuth()

  // users list
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // register form
  const [form, setForm] = useState({ username: "", password: "", user_type: "", department: "" })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")

  // inline role editing
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [roleLoading, setRoleLoading] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await getAllUsers(token)
      setUsers(data)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => { fetchUsers() }, [token])

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    setFormSuccess("")
    try {
      const data = await registerUser(token, form)
      console.log("Registered user:", data)
      setFormSuccess(`"${form.username}" registered successfully`)
      setForm({ username: "", password: "", user_type: "", department: "" })
      fetchUsers()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, username) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    setDeleteLoading(id)
    try {
      await deleteUser(token, id)
      fetchUsers()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleRoleChange = async (id, newRole) => {
    setRoleLoading(id)
    try {
      await changeUserRole(token, id, newRole)
      setEditingRoleId(null)
      fetchUsers()
    } catch (err) {
      alert(err.message)
    } finally {
      setRoleLoading(null)
    }
  }

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
            <span className="nav-icon">◈</span> User Management
          </a>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar admin-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role" style={{ color: "#f87171" }}>Admin</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-title">User Management</h1>
            <p className="dash-sub">Register, manage roles, and remove users</p>
          </div>
          <div className="admin-badge">
            <span className="admin-badge-dot" />
            Admin Console
          </div>
        </div>

        <div className="admin-layout">
          {/* Register Panel */}
          <div className="admin-panel">
            <div className="panel-header">
              <h2 className="panel-title">Register New User</h2>
              <p className="panel-sub">Add a new user to the system</p>
            </div>

            <form onSubmit={handleRegister} className="admin-form">
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

              {formError && <div className="form-error">{formError}</div>}
              {formSuccess && <div className="form-success">{formSuccess}</div>}

              <button type="submit" className="btn-primary btn-full" disabled={formLoading}>
                {formLoading ? <span className="btn-spinner" /> : "Register User"}
              </button>
            </form>
          </div>

          {/* Users List Panel */}
          <div className="admin-panel panel-wide">
            <div className="panel-header">
              <h2 className="panel-title">All Users</h2>
              <p className="panel-sub">{users.length} user{users.length !== 1 ? "s" : ""} in the system</p>
            </div>

            {loadingUsers ? (
              <div className="table-empty">Loading...</div>
            ) : users.length === 0 ? (
              <div className="table-empty">No users found.</div>
            ) : (
              <table className="req-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={u.id === user?.userId ? "current-user-row" : ""}>
                      <td className="td-item">
                        {u.username}
                        {u.id === user?.userId && <span className="you-badge">you</span>}
                      </td>
                      <td>{u.department}</td>
                      <td>
                        {editingRoleId === u.id ? (
                          <div className="role-edit">
                            <select
                              className="field-input role-select"
                              defaultValue={u.user_type}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                              disabled={roleLoading === u.id}
                              autoFocus
                            >
                              {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button className="cancel-edit-btn"
                              onClick={() => setEditingRoleId(null)}>✕</button>
                          </div>
                        ) : (
                          <div className="role-display">
                            <TypeBadge type={u.user_type} />
                            {u.id !== user?.userId && (
                              <button className="edit-role-btn"
                                onClick={() => setEditingRoleId(u.id)}>
                                ✎
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="td-date">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        {u.id !== user?.userId && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(u.id, u.username)}
                            disabled={deleteLoading === u.id}
                          >
                            {deleteLoading === u.id ? "..." : "✕"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}