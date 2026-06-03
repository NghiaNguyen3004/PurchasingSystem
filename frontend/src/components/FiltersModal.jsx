import {useState} from "react"

import "../styles/keyboardShortcuts.css"
import "../styles/requestModal.css"
import "../styles/filterModal.css"

import {useKeyboardShortcuts} from "../hook/useKeyboardShortcuts.js"
import { useFocusTrap } from "../hook/useFocusTrap.js"

export default function FiltersModal({ filters, onApply, onClose }) {
    const [temp, setTemp] = useState(filters)
    const trapRef = useFocusTrap(true)

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

    useKeyboardShortcuts([
        { key: "Enter", fn: handleApply },
        { key: "Escape", fn: onClose },
        { key: "c", fn: handleClear}
    ]);

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card filter-modal-card" ref = {trapRef} onClick={e => e.stopPropagation()}>
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
            <button className="btn-secondary" onClick={handleClear}>Clear <kbd className="kbd-dark">C</kbd> </button>
            <button className="btn-primary" onClick={handleApply}>Apply <kbd className="kbd">Enter</kbd></button>
            </div>
        </div>
        </div>
    )
}