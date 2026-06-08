import StatusBadge from "./statusBadge.jsx"
import "../styles/approverDashboard.css"
import React from 'react'

const STATUS_ORDER = ["Pending", "Approved", "Processing", "Completed", "Rejected"]


function StatusTimeline({ status }) {
  const activeIndex = STATUS_ORDER.indexOf(status)
  const isRejected = status === "Rejected"

  if (isRejected) {
    return (
      <div className="status-timeline rejected-timeline">
        <span className="timeline-rejected">✕ Rejected</span>
      </div>
    )
  }

  return (
    <div className="status-timeline">
      {STATUS_ORDER.filter(s => s !== "Rejected").map((s, i) => (
        <div key={s} className={`timeline-step ${i <= activeIndex ? "step-done" : ""} ${s === status ? "step-active" : ""}`}>
          <div className="step-dot" />
          <span className="step-label">{s}</span>
          {i < STATUS_ORDER.filter(s => s !== "Rejected").length - 1 && (
            <div className={`step-line ${i < activeIndex ? "line-done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ApproverRow({ request, index, focusedIndex, setFocusedIndex, expandedId, toggleExpand, onApprove, onReject, actionLoading }) {
  const isFocused  = focusedIndex === index
  const isExpanded = expandedId === request.id
  const isLoading  = actionLoading === request.id

  return (
    <React.Fragment key={request.id}>
      <tr
        tabIndex={0}
        className={`${isFocused ? "row-focused" : ""} ${isExpanded ? "row-expanded" : ""}`}
        onFocus={() => setFocusedIndex(index)}
        onKeyDown={e => { if (e.key === "Enter") toggleExpand(request.id) }}
      >
        <td className="td-item">
          <div className="supplier-cell">
            <div className="supplier-avatar">{request.supplier_name?.[0]?.toUpperCase()}</div>
            {request.supplier_name}
          </div>
        </td>
        <td><span className="type-tag">{request.request_type_name}</span></td>
        <td>
          <div className="requester-info">
            <div className="requester-avatar">{request.requester?.[0]?.toUpperCase()}</div>
            {request.requester}
          </div>
        </td>
        <td>{request.department}</td>
        <td><span className="budget-tag">{request.budget_code}</span></td>
        <td><StatusBadge status={request.status} /></td>
        <td className="td-date">{request.expected_delivery}</td>
        <td className="td-date">{new Date(request.created_at).toLocaleDateString()}</td>
        <td>
          <div className="action-btns">
            {request.status === "Pending" && (
              <>
                <button className="approve-btn" onClick={() => onApprove(request.id)} disabled={isLoading}>
                  {isLoading ? "..." : "✓"}
                  {isFocused && <kbd className="kbd-dark">A</kbd>}
                </button>
                <button className="reject-btn" onClick={() => onReject(request.id)} disabled={isLoading}>
                  {isLoading ? "..." : "✕"}
                  {isFocused && <kbd className="kbd-dark">R</kbd>}
                </button>
              </>
            )}
            <button className="expand-btn" onClick={() => toggleExpand(request.id)}>
              {isExpanded ? "∧" : "∨"}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="expand-row">
          <td colSpan={9}>
            <div className="expand-panel">
              <StatusTimeline status={request.status} />
              <div className="expand-grid">
                <div><span className="expand-label">Supplier</span><span>{request.supplier_name}</span></div>
                <div><span className="expand-label">Requested By</span><span>{request.requester}</span></div>
                <div><span className="expand-label">Department</span><span>{request.department}</span></div>
                <div><span className="expand-label">Budget Code</span><span className="budget-tag">{request.budget_code}</span></div>
                <div><span className="expand-label">Delivery</span><span>{request.expected_delivery}</span></div>
                <div className="expand-reason"><span className="expand-label">Reason</span><span>{request.reason}</span></div>
              </div>
              <div className="expand-items">
                <div className="expand-items-title">
                  Items <span className="expand-items-count">{request.items?.length || 0}</span>
                </div>
                <table className="items-inner-table">
                  <thead>
                    <tr><th>Code</th><th>Item</th><th>Unit</th><th>Qty</th></tr>
                  </thead>
                  <tbody>
                    {request.items?.map((item, i) => (
                      <tr key={i}>
                        <td><span className="budget-tag">{item.item_code}</span></td>
                        <td className="td-item">{item.item_name}</td>
                        <td>{item.unit}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {request.status === "Pending" && (
                <div className="expand-actions">
                  <button className="approve-btn approve-btn-lg" onClick={() => onApprove(request.id)}>
                    ✓ Approve Request
                  </button>
                  <button className="reject-btn reject-btn-lg" onClick={() => onReject(request.id)}>
                    ✕ Reject Request
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  )
}