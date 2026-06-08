import { useEffect, useState } from "react"
import { useFocusTrap } from "../hook/useFocusTrap.js"
import StatusBadge from "./statusBadge.jsx"
import "../styles/requestDetailModal.css"

export default function RequestDetailModal({
  requests,        // full list for navigation
  currentIndex,    // which request is open
  onClose,
  onApprove,
  onReject,
}) {
  const trapRef = useFocusTrap(true)
  const [index, setIndex]       = useState(currentIndex)
  const [actionLoading, setActionLoading] = useState(null)
  const [actionDone, setActionDone]       = useState(null) // "approved" | "rejected"

  const request    = requests[index]
  const hasPrev    = index > 0
  const hasNext    = index < requests.length - 1
  const isPending  = request?.status === "Pending"

  // reset action state when navigating
  useEffect(() => { setActionDone(null) }, [index])

  // keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const tag = e.target.tagName.toLowerCase()
      if (["input", "textarea", "select"].includes(tag)) return

      if (e.key === "ArrowLeft"  && hasPrev) setIndex(i => i - 1)
      if (e.key === "ArrowRight" && hasNext) setIndex(i => i + 1)
      if (e.key === "Escape") onClose()
      if (e.key === "a" || e.key === "A") handleApprove()
      if (e.key === "r" || e.key === "R") handleReject()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [index, hasPrev, hasNext, isPending])

  const handleApprove = async () => {
    if (!isPending || actionLoading) return
    setActionLoading("approve")
    try {
      await onApprove(request.id)
      setActionDone("approved")
      // move to next after short delay
      setTimeout(() => {
        if (hasNext) setIndex(i => i + 1)
        else onClose()
      }, 800)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!isPending || actionLoading) return
    setActionLoading("reject")
    try {
      await onReject(request.id)
      setActionDone("rejected")
      setTimeout(() => {
        if (hasNext) setIndex(i => i + 1)
        else onClose()
      }, 800)
    } finally {
      setActionLoading(null)
    }
  }

  if (!request) return null

  return (
    <div className="rdm-overlay" onClick={onClose}>
      <div className="rdm-modal" ref={trapRef} onClick={e => e.stopPropagation()}>

        {/* Top bar */}
        <div className="rdm-topbar">
          <div className="rdm-nav">
            <button
              className="rdm-nav-btn"
              onClick={() => setIndex(i => i - 1)}
              disabled={!hasPrev}
              title="Previous (←)"
            >
              ←
            </button>
            <span className="rdm-nav-label">
              Request <strong>{index + 1}</strong> of <strong>{requests.length}</strong>
            </span>
            <button
              className="rdm-nav-btn"
              onClick={() => setIndex(i => i + 1)}
              disabled={!hasNext}
              title="Next (→)"
            >
              →
            </button>
          </div>

          <div className="rdm-topbar-right">
            <div className="rdm-shortcuts">
              <kbd className="rdm-kbd">←→</kbd> Navigate
              {isPending && <><kbd className="rdm-kbd">A</kbd> Approve <kbd className="rdm-kbd">R</kbd> Reject</>}
              <kbd className="rdm-kbd">Esc</kbd> Close
            </div>
            <button className="rdm-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Action done overlay */}
        {actionDone && (
          <div className={`rdm-action-banner ${actionDone === "approved" ? "banner-approved" : "banner-rejected"}`}>
            {actionDone === "approved" ? "✓ Request Approved — moving to next..." : "✕ Request Rejected — moving to next..."}
          </div>
        )}

        <div className="rdm-body">

          {/* Left — request info */}
          <div className="rdm-info">

            {/* Header */}
            <div className="rdm-header-block">
              <div className="rdm-supplier-row">
                <div className="rdm-supplier-avatar">
                  {request.supplier_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="rdm-supplier-name">{request.supplier_name}</h2>
                  <div className="rdm-meta-row">
                    <span className="type-tag">{request.request_type_name}</span>
                    <span className="rdm-dot">·</span>
                    <span className="rdm-dept">{request.department}</span>
                  </div>
                </div>
                <div className="rdm-status-wrap">
                  <StatusBadge status={request.status} />
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="rdm-details-grid">
              <div className="rdm-detail-item">
                <span className="rdm-detail-label">Requested By</span>
                <div className="requester-info">
                  <div className="requester-avatar">{request.requester?.[0]?.toUpperCase()}</div>
                  <span className="rdm-detail-value">{request.requester}</span>
                </div>
              </div>
              <div className="rdm-detail-item">
                <span className="rdm-detail-label">Budget Code</span>
                <span className="budget-tag rdm-detail-value">{request.budget_code}</span>
              </div>
              <div className="rdm-detail-item">
                <span className="rdm-detail-label">Expected Delivery</span>
                <span className="rdm-detail-value">{request.expected_delivery}</span>
              </div>
              <div className="rdm-detail-item">
                <span className="rdm-detail-label">Submitted</span>
                <span className="rdm-detail-value">
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="rdm-detail-item rdm-detail-full">
                <span className="rdm-detail-label">Reason</span>
                <span className="rdm-detail-value rdm-reason">{request.reason}</span>
              </div>
            </div>

            {/* Action buttons */}
            {isPending && !actionDone && (
              <div className="rdm-actions">
                <button
                  className="rdm-reject-btn"
                  onClick={handleReject}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "reject"
                    ? <span className="btn-spinner" />
                    : <><span>✕</span> Reject Request <kbd className="rdm-kbd-dark">R</kbd></>
                  }
                </button>
                <button
                  className="rdm-approve-btn"
                  onClick={handleApprove}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "approve"
                    ? <span className="btn-spinner" />
                    : <><span>✓</span> Approve Request <kbd className="rdm-kbd-dark">A</kbd></>
                  }
                </button>
              </div>
            )}

            {!isPending && (
              <div className="rdm-actioned">
                {request.status === "Approved"   && <span className="actioned-approved">✓ This request has been approved</span>}
                {request.status === "Rejected"   && <span className="actioned-rejected">✕ This request has been rejected</span>}
                {request.status === "Processing" && <span className="actioned-processing">⟳ This request is being processed</span>}
                {request.status === "Completed"  && <span className="actioned-completed">✓ This request has been completed</span>}
              </div>
            )}
          </div>

          {/* Right — items */}
          <div className="rdm-items">
            <div className="rdm-items-header">
              <h3 className="rdm-items-title">Items</h3>
              <span className="expand-items-count">
                {request.items?.length || 0} item{request.items?.length !== 1 ? "s" : ""}
              </span>
            </div>

            {!request.items || request.items.length === 0 ? (
              <div className="rdm-empty">No items found</div>
            ) : (
              <div className="rdm-items-list">
                {request.items.map((item, i) => (
                  <div key={i} className="rdm-item-card">
                    <div className="rdm-item-top">
                      <span className="rdm-item-name">{item.item_name}</span>
                      <span className="rdm-item-qty">×{item.quantity}</span>
                    </div>
                    <div className="rdm-item-bottom">
                      <span className="budget-tag">{item.item_code}</span>
                      <span className="rdm-item-unit">per {item.unit}</span>
                      {item.unit_price_snapshot
                        ? <span className="rdm-item-price">${Number(item.unit_price_snapshot).toLocaleString()}</span>
                        : <span className="rdm-item-price-pending">Pending pricing</span>
                      }
                    </div>
                  </div>
                ))}
                {showPricing && (
                <input
                    className="price-input"
                    type="number"
                    placeholder="Set price..."
                    defaultValue={item.unit_price_snapshot ?? ""}
                    onChange={e => handlePriceChange(item.id, e.target.value)}
                />
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}