import StatusBadge from "./statusBadge.jsx"
import "../styles/approverDashboard.css"
import React from 'react'

export default function ApproverRow({ request, index, focusedIndex, setFocusedIndex, onView, actionLoading }) {
  const isFocused  = focusedIndex === index
  const isLoading  = actionLoading === request.id

  return (
    <>
      <tr
        tabIndex={0}
        className={`${isFocused ? "row-focused" : ""}`}
        onFocus={() => setFocusedIndex(index)}
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
          <div className = 'action-btns'>
            <button className="view-btn" onClick={() => onView(index)}>
                View
            </button>
          </div>
        </td>
      </tr>
   

    </>
  )
}