import '../styles/requestModal.css';
import { useState, useEffect } from "react";
import {DEPARTMENTS} from "../constants/department.js"

export default function NewRequestModal({ onClose, onSubmit }) {
    function generateBudgetCode(department) {
        const deptCode = department?.slice(0, 3).toUpperCase() || "GEN"
        const year = new Date().getFullYear()
        const random = String(Math.floor(Math.random() * 9000) + 1000) // always 4 digits
        return `${deptCode}-${year}-${random}`
    }
    const emptyForm = {
    item_name: "", quantity: "", price_per_unit: "",
    department: "", budget_code: "", reason: "",
    }

    const [form, setForm] = useState({...emptyForm});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [savedCount, setSavedCount] = useState(0);

    const handleDepartmentChange = (e) => {
        const dept = e.target.value || "";
        setForm({ ...form, department: dept, budget_code: generateBudgetCode(dept) });
    };

    // submits current form, resets for next one, keeps modal open
    const handleSaveAndContinue = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
        await onSubmit(form)
        setSavedCount(c => c + 1)
        setForm({ ...emptyForm })  // reset for next request
        } catch (err) {
        setError(err.message)
        } finally {
        setLoading(false)
        }
    }

    // submits if form has data, then closes
    const handleDone = async () => {
        const hasData = form.item_name.trim()
        if (hasData) {
        setLoading(true)
        setError("")
        try {
            await onSubmit(form)
        } catch (err) {
            setError(err.message)
            setLoading(false)
            return
        }
        }
        onClose()
    }
    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
            <h2 className="modal-title">New Purchase Request</h2>
            <button className="modal-close" onClick={handleDone}>✕</button>
            </div>

            {savedCount > 0 && (
            <div className="saved-indicator">
                ✓ {savedCount} request{savedCount > 1 ? "s" : ""} saved
            </div>
            )}

            <form className="modal-form" onSubmit={handleSaveAndContinue}>
            <div className="form-row">
                <div className="field-group">
                <label className="field-label">Item Name</label>
                <input className="field-input" placeholder="e.g. Laptop" required
                    value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} />
                </div>
                <div className="field-group">
                    <label className="field-label">Department</label>
                    <select
                        className="field-input field-select"
                        value={form.department}
                        onChange={handleDepartmentChange}
                        required
                    >
                        <option value="">Select department...</option>
                        {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    </div>
            </div>
            <div className="form-row">
                <div className="field-group">
                <label className="field-label">Quantity</label>
                <input className="field-input" type="number" min="1" placeholder="1" required
                    value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div className="field-group">
                <label className="field-label">Price per Unit ($)</label>
                <input className="field-input" type="number" min="0" step="0.01" placeholder="0.00" required
                    value={form.price_per_unit} onChange={e => setForm({ ...form, price_per_unit: e.target.value })} />
                </div>
            </div>
            <div className="field-group">
                <label className="field-label">Reason</label>
                <textarea className="field-input field-textarea" placeholder="Why is this purchase needed?" required
                value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleDone}>Done</button>
                <button type="submit" className="btn-save-continue" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : <>Save & Add More <kbd className="kbd-dark">↵</kbd></>}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}