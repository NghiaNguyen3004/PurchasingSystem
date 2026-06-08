import { useState, useEffect } from "react"
import { useAuth } from "../context/authContext.jsx"
import { useRequest } from "../hook/useRequest.js"
import { useKeyboardShortcuts } from "../hook/useKeyboardShortcuts.js"
import { useTableNavigation } from "../hook/useTableNavigation.js"
import SideBar from "../components/sideBar.jsx"
import StatsGrid from "../components/statsGrid.jsx"
import PageTable from "../components/pageTable.jsx"
import RequestRow from "../components/RequestRow.jsx"
import NewRequestModal from "../components/NewRequestModal.jsx"
import FiltersModal from "../components/FiltersModal.jsx"
import "../styles/requesterDashboard.css"
import "../styles/shared.css"

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Processing", "Completed", "Rejected"]

export default function RequesterDashboard() {
  const { token } = useAuth()
  const { requests, loading, submitNewRequest, fetchMyRequests } = useRequest(token)

  const [showModal,  setShowModal]  = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const [filters, setFilters] = useState({
    status:   "All",
    dateFrom: "",
    dateTo:   "",
  })

  useEffect(() => {
    fetchMyRequests()
  }, [token])

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  const filteredRequests = requests.filter(r => {
    const statusMatch = filters.status === "All" || r.status === filters.status
    const created = new Date(r.created_at)
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null
    const to   = filters.dateTo   ? new Date(filters.dateTo)   : null
    const dateMatch = (!from || created >= from) && (!to || created <= to)
    return statusMatch && dateMatch
  })

  const { focusedIndex, setFocusedIndex } = useTableNavigation(filteredRequests, toggleExpand)

  useKeyboardShortcuts([
    { key: "n", fn: () => setShowModal(true) },
    { key: "N", fn: () => setShowModal(true) },
    { key: "f", fn: () => setShowFilter(true) },
    { key: "F", fn: () => setShowFilter(true) },
    { key: "ArrowDown", fn: () => setFocusedIndex(0) },
  ])

  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status === "Pending").length,
    approved: requests.filter(r => r.status === "Approved").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
  }

  const isFilterActive = filters.status !== "All" || filters.dateFrom || filters.dateTo

  return (
    <div className="dash-root">
      <SideBar onAction={(action) => {
        if (action === "newRequest") setShowModal(true)
      }} />

      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-title">My Requests</h1>
            <p className="dash-sub">Track and manage your purchase requests</p>
          </div>
          <div className="topbar-actions">
            <button className="btn-filter" onClick={() => setShowFilter(true)}>
              ⚙ Filter
              <kbd className="kbd">F</kbd>
              {isFilterActive && <span className="filter-dot" />}
            </button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <span>＋</span> New Request
              <kbd className="kbd">N</kbd>
            </button>
          </div>
        </div>

        <StatsGrid stats={[
          { label: "Total Requests", value: stats.total,    accent: "#6366f1" },
          { label: "Pending",        value: stats.pending,  accent: "#f59e0b" },
          { label: "Approved",       value: stats.approved, accent: "#22c55e" },
          { label: "Rejected",       value: stats.rejected, accent: "#ef4444" },
        ]} />

        {isFilterActive && (
          <div className="active-filter-bar">
            <span>Filtered by: </span>
            {filters.status !== "All" && <span className="filter-chip">{filters.status}</span>}
            {filters.dateFrom && <span className="filter-chip">From {filters.dateFrom}</span>}
            {filters.dateTo   && <span className="filter-chip">To {filters.dateTo}</span>}
            <button className="clear-filter-btn"
              onClick={() => setFilters({ status: "All", dateFrom: "", dateTo: "" })}>
              Clear all
            </button>
          </div>
        )}

        <PageTable
          title="Request History"
          loading={loading}
          empty={filteredRequests.length === 0 ? "No requests found." : null}
        >
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Type</th>
              <th>Department</th>
              <th>Budget Code</th>
              <th>Status</th>
              <th>Delivery</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r, index) => (
              <RequestRow
                key={r.id}
                request={r}
                index={index}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
              />
            ))}
          </tbody>
        </PageTable>
      </main>

      {showModal && (
        <NewRequestModal
          onClose={() => setShowModal(false)}
          onSubmit={submitNewRequest}
        />
      )}

      {showFilter && (
        <FiltersModal
          filters={filters}
          statusOptions={STATUS_OPTIONS}
          onApply={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  )
}