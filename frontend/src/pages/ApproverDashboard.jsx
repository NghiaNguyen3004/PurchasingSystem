import {useState, useEffect} from 'react'
import {useAuth} from '../context/authContext.jsx'
import {useRequest} from '../hook/useRequest.js'
import {useKeyboardShortcuts} from '../hook/useKeyboardShortcuts.js'
import {useTableNavigation} from '../hook/useTableNavigation.js'
import SideBar from '../components/SideBar.jsx'
import StatsGrid from '../components/StatsGrid.jsx'
import PageTable from '../components/PageTable.jsx'
import ApproverRow from '../components/ApproveRow.jsx'
import "../styles/approverDashboard.css"



export default function ApproverDashboard() {
  const { token } = useAuth()
  const { requests, loading, fetchPending, approve, reject } = useRequest(token)

  const [statusFilter, setStatusFilter] = useState("Pending")
  const [expandedId, setExpandedId]     = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchPending() }, [token])

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  const filteredRequests = requests.filter(r =>
    statusFilter === "All" || r.status === statusFilter
  )

  const { focusedIndex, setFocusedIndex } = useTableNavigation(filteredRequests, toggleExpand)

  const handleApprove = async (id) => {
    setActionLoading(id)
    try { await approve(id) }
    finally { setActionLoading(null) }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try { await reject(id) }
    finally { setActionLoading(null) }
  }

  const handleApproveFocused = () => {
    if (focusedIndex === null) return
    const focused = filteredRequests[focusedIndex]
    if (!focused || focused.status !== "Pending") return
    handleApprove(focused.id)
  }

  const handleRejectFocused = () => {
    if (focusedIndex === null) return
    const focused = filteredRequests[focusedIndex]
    if (!focused || focused.status !== "Pending") return
    handleReject(focused.id)
  }

  useKeyboardShortcuts([
    { key: "ArrowDown", fn: () => setFocusedIndex(0) },
    { key: "a", fn: handleApproveFocused },
    { key: "A", fn: handleApproveFocused },
    { key: "r", fn: handleRejectFocused },
    { key: "R", fn: handleRejectFocused },
  ])

  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status === "Pending").length,
    approved: requests.filter(r => r.status === "Approved").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
  }

  return (
    <div className="dash-root">
      <SideBar />
      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-title">Purchase Requests</h1>
            <p className="dash-sub">Review and action pending requests</p>
          </div>
          {/* Filter bar */}
          <div className="filter-bar">
            {["All","Pending","Approved","Rejected"].map(s => (
              <button key={s}
                className={`filter-btn ${statusFilter === s ? "filter-active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >{s}</button>
            ))}
          </div>
        </div>

        <StatsGrid stats={[
          { label: "Total",    value: stats.total,    accent: "#6366f1" },
          { label: "Pending",  value: stats.pending,  accent: "#f59e0b" },
          { label: "Approved", value: stats.approved, accent: "#22c55e" },
          { label: "Rejected", value: stats.rejected, accent: "#ef4444" },
        ]} />

        <div className="keyboard-hint">
          <kbd className="kbd">↑↓</kbd> Navigate
          <kbd className="kbd">A</kbd> Approve
          <kbd className="kbd">R</kbd> Reject
          <kbd className="kbd">↵</kbd> Expand
        </div>

        <PageTable
          title={`${statusFilter} Requests`}
          loading={loading}
          empty={filteredRequests.length === 0 ? `No ${statusFilter.toLowerCase()} requests.` : null}
        >
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Type</th>
              <th>Requested By</th>
              <th>Department</th>
              <th>Budget Code</th>
              <th>Status</th>
              <th>Delivery</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r, index) => (
              <ApproverRow
                key={r.id}
                request={r}
                index={index}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
                onApprove={handleApprove}
                onReject={handleReject}
                actionLoading={actionLoading}
              />
            ))}
          </tbody>
        </PageTable>
      </main>
    </div>
  )
}