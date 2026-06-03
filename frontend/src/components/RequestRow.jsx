import StatusBadge from "../components/StatusBadge.jsx";

export default function RequestRow({request, index, focusedIndex, setFocusedIndex, onEdit}) {
    const isFocused = index === focusedIndex
    return (
        <tr
            className={isFocused ? "row-focused" : ""}
            onFocus={() => setFocusedIndex(index)}
            tabIndex={0}
        >
                <td className="td-item">{request.item_name}</td>
                <td>{request.quantity}</td>
                <td>${Number(request.price_per_unit).toLocaleString()}</td>
                <td className="td-total">${(request.quantity * request.price_per_unit).toLocaleString()}</td>
                <td><span className="budget-tag">{request.budget_code}</span></td>
                <td><StatusBadge status={request.status} /></td>
                <td className="td-date">{new Date(request.created_at).toLocaleDateString()}</td>
                <td>{request.status === "Pending" && (
                    <button
                    className="edit-btn"
                    onClick={() => onEdit(request)}
                    title="Edit request"
                    >
                    ✎
                    </button>
                    )}
                </td>
            
        </tr>
        
        
    )
}
