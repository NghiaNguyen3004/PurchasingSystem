import {useState} from "react"
import "../styles/requestModal.css"
import "../styles/filterModal.css"

export default function FiltersModal({ filters, onApply, onClose }) {
    const [temp, setTemp] = useState(filters)

    const handleApply = () => {
        onApply(temp)
        onClose()
    }

    const handleClear = () => {
        const reset = { status: "All", dateFrom: "", dateTo: "" }
        setTemp(reset)
        onApply(reset)
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card filter-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
            <h2 className="modal-title">Filter Requests</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <div className="filter-section">
            <label className="field-label">Status</label>
            <div className="filter-bar">
                {["All", "Pending", "Approved", "Rejected"].map(s => (
                <button
                    key={s}
                    className={`filter-btn ${temp.status === s ? "filter-active" : ""}`}
                    onClick={() => setTemp({ ...temp, status: s })}
                >
                    {s}
                </button>
                ))}
            </div>
            </div>

            <div className="filter-section">
            <label className="field-label">Date Range</label>
            <div className="date-range">
                <input
                type="date"
                className="field-input date-input"
                value={temp.dateFrom}
                onChange={e => setTemp({ ...temp, dateFrom: e.target.value })}
                />
                <span className="date-sep">→</span>
                <input
                type="date"
                className="field-input date-input"
                value={temp.dateTo}
                onChange={e => setTemp({ ...temp, dateTo: e.target.value })}
                />
            </div>
            </div>

            <div className="modal-actions">
            <button className="btn-secondary" onClick={handleClear}>Clear</button>
            <button className="btn-primary" onClick={handleApply}>Apply</button>
            </div>
        </div>
        </div>
    )
}