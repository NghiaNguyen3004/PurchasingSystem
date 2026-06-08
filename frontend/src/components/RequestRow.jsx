import StatusBadge from "./statusBadge.jsx"

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

export default function RequestRow({ request, index, focusedIndex, setFocusedIndex, expandedId, toggleExpand }) {
  const isFocused  = focusedIndex === index
  const isExpanded = expandedId === request.id

  return (
    <>
      <tr
        tabIndex={0}
        className={`${isFocused ? "row-focused" : ""} ${isExpanded ? "row-expanded" : ""}`}
        onFocus={() => setFocusedIndex(index)}
        onKeyDown={(e) => { if (e.key === "Enter") toggleExpand(request.id) }}
      >
        {/* Supplier */}
        <td className="td-item">
          <div className="supplier-cell">
            <div className="supplier-avatar">
              {request.supplier_name?.[0]?.toUpperCase()}
            </div>
            {request.supplier_name}
          </div>
        </td>

        {/* Type */}
        <td>
          <span className="type-tag">{request.request_type_name}</span>
        </td>

        {/* Department */}
        <td>{request.department}</td>

        {/* Budget Code */}
        <td>
          <span className="budget-tag">{request.budget_code}</span>
        </td>

        {/* Status */}
        <td>
          <StatusBadge status={request.status} />
        </td>

        {/* Expected Delivery */}
        <td className="td-date">{request.expected_delivery}</td>

        {/* Submitted */}
        <td className="td-date">
          {new Date(request.created_at).toLocaleDateString()}
        </td>

        {/* Expand */}
        <td>
          <button
            className="expand-btn"
            onClick={() => toggleExpand(request.id)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "∧" : "∨"}
            {isFocused && !isExpanded && <kbd className="kbd-dark">↵</kbd>}
          </button>
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr className="expand-row">
          <td colSpan={8}>
            <div className="expand-panel">

              {/* Status timeline */}
              <StatusTimeline status={request.status} />

              {/* Meta info */}
              <div className="expand-grid">
                <div>
                  <span className="expand-label">Supplier</span>
                  <span>{request.supplier_name}</span>
                </div>
                <div>
                  <span className="expand-label">Department</span>
                  <span>{request.department}</span>
                </div>
                <div>
                  <span className="expand-label">Budget Code</span>
                  <span className="budget-tag">{request.budget_code}</span>
                </div>
                <div>
                  <span className="expand-label">Expected Delivery</span>
                  <span>{request.expected_delivery}</span>
                </div>
                <div>
                  <span className="expand-label">Submitted</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
                <div className="expand-reason">
                  <span className="expand-label">Reason</span>
                  <span>{request.reason}</span>
                </div>
              </div>

              {/* Items table */}
              <div className="expand-items">
                <div className="expand-items-title">
                  Items
                  <span className="expand-items-count">{request.items?.length || 0} item{request.items?.length !== 1 ? "s" : ""}</span>
                </div>
                {!request.items || request.items.length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, padding: "10px 0" }}>
                    No items found
                  </div>
                ) : (
                  <table className="items-inner-table">
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Unit</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.items.map((item, i) => (
                        <tr key={i}>
                          <td>
                            <span className="budget-tag">{item.item_code}</span>
                          </td>
                          <td className="td-item">{item.item_name}</td>
                          <td style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{item.unit}</td>
                          <td>{item.quantity}</td>
                          <td style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                            {item.unit_price_snapshot
                              ? `$${Number(item.unit_price_snapshot).toLocaleString()}`
                              : <span style={{ color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>Pending pricing</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  )
}