import '../styles/requesterDashboard.css'
import { useState, useEffect } from "react";
export default function NewRequestModal({ onClose, onSubmit }) {

    function generateBudgetCode(department) {
        const deptCode = department?.slice(0, 3).toUpperCase() || "GEN"
        const year = new Date().getFullYear()
        const random = String(Math.floor(Math.random() * 9000) + 1000) // always 4 digits
        return `${deptCode}-${year}-${random}`
    }

    const [form, setForm] = useState({
        item_name: "", quantity: "", price_per_unit: "", department: "", budget_code: "", reason: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDepartmentChange = (e) => {
        const dept = e.target.value;
        setForm({ ...form, department: dept, budget_code: generateBudgetCode(dept) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
        await onSubmit(form);
        onClose();
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
            <h2 className="modal-title">New Purchase Request</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="field-group">
                <label className="field-label">Item Name</label>
                <input className="field-input" placeholder="e.g. Laptop" required
                    value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} />
                </div>
                <div className="field-group">
                <label className="field-label">Department</label>
                <input
                    className="field-input"
                    placeholder="e.g. IT, HR, Finance"
                    value={form.department}
                    onChange={handleDepartmentChange}
                    required
                />
                </div>
                <div className="field-group">
                    <label className="field-label">Budget Code</label>
                    <input
                    className="field-input"
                    value={form.budget_code}
                    readOnly 
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
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
                <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : "Submit Request"}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}