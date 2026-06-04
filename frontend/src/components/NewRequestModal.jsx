import '../styles/requestModal.css';
import { useState, useEffect } from "react";
import {DEPARTMENTS} from "../constants/department.js"
import {useKeyboardShortcuts} from "../hook/useKeyboardShortcuts.js"
import { useFocusTrap } from '../hook/useFocusTrap.js';
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

export default function NewRequestModal({ onClose, onSubmit, initialData = null }) {
    const trapRef = useFocusTrap(true)
    const isEditing = initialData !== null

    const [form, setForm] = useState({...emptyForm});

    // add this right after
    useEffect(() => {
    if (initialData) {
        setForm({
        item_name: initialData.item_name,
        quantity: initialData.quantity,
        price_per_unit: initialData.price_per_unit,
        department: initialData.department,
        budget_code: initialData.budget_code,
        reason: initialData.reason,
        })
    }
    }, [initialData?.id])  // 👈 only re-runs if a different request is opened
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [savedCount, setSavedCount] = useState(0);

    const handleDepartmentChange = (e) => {
        const dept = e.target.value || ""
        setForm(prev => ({ 
            ...prev,
            department: dept, 
            budget_code: generateBudgetCode(dept) 
        }));
    };

    // submits current form, resets for next one, keeps modal open
    const handleSaveAndContinue = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            await onSubmit(form)
            if (isEditing){ 
                onClose()
            } else{
                setSavedCount(c => c + 1)
                setForm({ ...emptyForm })  // reset for next request
            }
            
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

    useKeyboardShortcuts([
        { key: "Escape", fn: handleDone },
        { key: "Shift+Enter", fn: handleSaveAndContinue, metaKey: true }
        
    ]); 

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" ref={trapRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
            <h2 className="modal-title">{isEditing ? "Edit" : "New"} Purchase Request</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            {savedCount > 0 && (
            <div className="saved-indicator">
                {savedCount} request{savedCount > 1 ? "s" : ""} saved ✓ 
            </div>
            )}

            <form className="modal-form" onSubmit={handleSaveAndContinue}>
            <div className="form-row">
                <div className="field-group">
                <label className="field-label">Item Name</label>
                <input className="field-input" placeholder="e.g. Laptop" required
                    value={form.item_name} onChange={e => setForm(prev => ({ ...prev, item_name: e.target.value }))} />
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
                    value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))} />
                </div>
                <div className="field-group">
                <label className="field-label">Price per Unit ($)</label>
                <input className="field-input" type="number" min="0" step="0.01" placeholder="0.00" required
                    value={form.price_per_unit} onChange={e => setForm(prev => ({ ...prev, price_per_unit: e.target.value }))} />
                </div>
            </div>
            <div className="field-group">
                <label className="field-label">Reason</label>
                <textarea className="field-input field-textarea" placeholder="Why is this purchase needed?" required
                value={form.reason} onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))} />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleDone}>Done</button>
                <button type="submit" className="btn-save-continue" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : isEditing ? <>Save Changes</> : <>Save & Add More</>}<kbd className="kbd-dark">↵</kbd>
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}