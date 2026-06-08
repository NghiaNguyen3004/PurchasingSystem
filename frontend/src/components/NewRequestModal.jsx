import { useState, useEffect } from "react"
import { useAuth } from "../context/authContext.jsx"
import { getRequestTypes, getSuppliersByType, getItemsBySupplier } from "../services/api.js"
import { generateBudgetCode } from "../utils/budgetCode.js"
import { DEPARTMENTS } from "../constants/department.js"
import { useFocusTrap } from "../hook/useFocusTrap.js"
import "../styles/requestModal.css"

export default function NewRequestModal({ onClose, onSubmit }) {
  const { token } = useAuth()
  const trapRef = useFocusTrap(true)

  // master data
  const [requestTypes, setRequestTypes]   = useState([])
  const [suppliers, setSuppliers]         = useState([])
  const [catalogItems, setCatalogItems]   = useState([])

  // header form
  const [header, setHeader] = useState({
    request_type_id:  "",
    supplier_id:      "",
    department:       "",
    budget_code:      "",
    reason:           "",
    expected_delivery: "",
  })

  // item selection
  const [search, setSearch]           = useState("")
  const [selectedItems, setSelectedItems] = useState([])  // [{ supplier_item_id, name, item_code, unit, quantity }]

  // ui state
  const [loadingTypes, setLoadingTypes]         = useState(true)
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [loadingItems, setLoadingItems]         = useState(false)
  const [submitting, setSubmitting]             = useState(false)
  const [error, setError]                       = useState("")
  const [savedCount, setSavedCount]             = useState(0)

  // ── Load request types on mount ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingTypes(true)
      try {
        const types = await getRequestTypes(token)
        setRequestTypes(types)
        if (types.length > 0) {
          // auto-select first type
          setHeader(prev => ({ ...prev, request_type_id: types[0].id }))
        }
      } finally {
        setLoadingTypes(false)
      }
    }
    load()
  }, [])

  // ── Load suppliers when type changes ─────────────────────────────────────
  useEffect(() => {
    if (!header.request_type_id) return
    const load = async () => {
      setLoadingSuppliers(true)
      setSuppliers([])
      setHeader(prev => ({ ...prev, supplier_id: "" }))
      setCatalogItems([])
      setSelectedItems([])
      try {
        const data = await getSuppliersByType(token, header.request_type_id)
        setSuppliers(data)
      } finally {
        setLoadingSuppliers(false)
      }
    }
    load()
  }, [header.request_type_id])

  // ── Load items when supplier changes ─────────────────────────────────────
  useEffect(() => {
    if (!header.supplier_id) return
    const load = async () => {
      setLoadingItems(true)
      setCatalogItems([])
      try {
        const data = await getItemsBySupplier(token, header.supplier_id)
        setCatalogItems(data)
      } finally {
        setLoadingItems(false)
      }
    }
    load()
  }, [header.supplier_id])

  // ── Department → budget code ──────────────────────────────────────────────
  const handleDepartmentChange = (dept) => {
    setHeader(prev => ({
      ...prev,
      department:  dept,
      budget_code: generateBudgetCode(dept),
    }))
  }

  // ── Supplier change with warning ──────────────────────────────────────────
  const handleSupplierChange = (supplierId) => {
    if (selectedItems.length > 0) {
      const ok = window.confirm(
        "Changing the supplier will clear all selected items. Continue?"
      )
      if (!ok) return
      setSelectedItems([])
    }
    setHeader(prev => ({ ...prev, supplier_id: supplierId }))
  }

  // ── Item selection ────────────────────────────────────────────────────────
  const isSelected = (id) => selectedItems.some(i => i.supplier_item_id === id)

  const toggleItem = (item) => {
    if (isSelected(item.id)) {
      setSelectedItems(prev => prev.filter(i => i.supplier_item_id !== item.id))
    } else {
      setSelectedItems(prev => [...prev, {
        supplier_item_id: item.id,
        name:      item.name,
        item_code: item.item_code,
        unit:      item.unit,
        quantity:  1,
      }])
    }
  }

  const updateQuantity = (supplier_item_id, qty) => {
    setSelectedItems(prev => prev.map(i =>
      i.supplier_item_id === supplier_item_id
        ? { ...i, quantity: Math.max(1, Number(qty)) }
        : i
    ))
  }

  const removeItem = (supplier_item_id) => {
    setSelectedItems(prev => prev.filter(i => i.supplier_item_id !== supplier_item_id))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedItems.length === 0) {
      setError("Please select at least one item")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await onSubmit({
        ...header,
        items: selectedItems.map(i => ({
          supplier_item_id: i.supplier_item_id,
          quantity:         i.quantity,
        }))
      })
      setSavedCount(c => c + 1)
      // reset for next request
      setSelectedItems([])
      setHeader(prev => ({
        ...prev,
        supplier_id:       "",
        department:        "",
        budget_code:       "",
        reason:            "",
        expected_delivery: "",
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDone = () => onClose()

  // ── Filtered catalog ──────────────────────────────────────────────────────
  const filtered = catalogItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.item_code.toLowerCase().includes(search.toLowerCase())
  )

  const typeName = requestTypes.find(t => t.id === Number(header.request_type_id))?.name || ""

  return (
    <div className="nrm-overlay">
      <div className="nrm-panel" ref={trapRef}>

        {/* Header bar */}
        <div className="nrm-topbar">
          <div className="nrm-topbar-left">
            <span className="nrm-logo">⬡</span>
            <div>
              <h2 className="nrm-title">New Purchase Request</h2>
              <p className="nrm-sub">{typeName && `${typeName} · `}Fill in the details and select items</p>
            </div>
          </div>
          <div className="nrm-topbar-right">
            {savedCount > 0 && (
              <div className="nrm-saved">✓ {savedCount} request{savedCount > 1 ? "s" : ""} saved</div>
            )}
            <button className="nrm-close" onClick={handleDone}>✕</button>
          </div>
        </div>

        <div className="nrm-body">

          {/* Left — Header form */}
          <form className="nrm-form" onSubmit={handleSubmit} id="request-form">
            <div className="nrm-section-title">Request Details</div>

            <div className="field-group">
              <label className="field-label">Request Type</label>
              {loadingTypes ? (
                <div className="field-loading">Loading...</div>
              ) : (
                <select className="field-input field-select"
                  value={header.request_type_id}
                  onChange={e => setHeader(prev => ({ ...prev, request_type_id: Number(e.target.value) }))}
                  required
                >
                  {requestTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">Supplier</label>
              {loadingSuppliers ? (
                <div className="field-loading">Loading suppliers...</div>
              ) : (
                <select className="field-input field-select"
                  value={header.supplier_id}
                  onChange={e => handleSupplierChange(Number(e.target.value))}
                  required
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">Department</label>
              <select className="field-input field-select"
                value={header.department}
                onChange={e => handleDepartmentChange(e.target.value)}
                required
              >
                <option value="">Select department...</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Budget Code</label>
              <input className="field-input" value={header.budget_code} readOnly
                placeholder="Auto-generated from department"
                style={{ opacity: 0.6, cursor: "not-allowed" }} />
            </div>

            <div className="field-group">
              <label className="field-label">Expected Delivery</label>
              <input className="field-input" type="date" required
                value={header.expected_delivery}
                onChange={e => setHeader(prev => ({ ...prev, expected_delivery: e.target.value }))} />
            </div>

            <div className="field-group">
              <label className="field-label">Reason</label>
              <textarea className="field-input field-textarea"
                placeholder="Why is this purchase needed?"
                required
                value={header.reason}
                onChange={e => setHeader(prev => ({ ...prev, reason: e.target.value }))} />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="nrm-form-actions">
              <button type="button" className="btn-secondary" onClick={handleSubmit}>
                Done
              </button>
              <button type="submit" form="request-form" className="btn-primary" disabled={submitting}>
                {submitting ? <span className="btn-spinner" /> : <>Save & Add More</>}
              </button>
            </div>
          </form>

          {/* Right — Item selection */}
          <div className="nrm-items-panel">
            <div className="nrm-section-title">
              Item Catalog
              {header.supplier_id && (
                <span className="nrm-item-count">
                  {selectedItems.length} selected
                </span>
              )}
            </div>

            {!header.supplier_id ? (
              <div className="nrm-empty-state">
                <div className="nrm-empty-icon">◈</div>
                <p>Select a supplier to browse items</p>
              </div>
            ) : loadingItems ? (
              <div className="nrm-empty-state">
                <p>Loading catalog...</p>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="nrm-search-wrap">
                  <input
                    className="field-input nrm-search"
                    placeholder="Search items or codes..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {/* Catalog list */}
                <div className="nrm-catalog">
                  {filtered.length === 0 ? (
                    <div className="nrm-empty-state">
                      <p>No items found</p>
                    </div>
                  ) : (
                    filtered.map(item => (
                      <div
                        key={item.id}
                        className={`nrm-catalog-item ${isSelected(item.id) ? "catalog-selected" : ""}`}
                        onClick={() => toggleItem(item)}
                      >
                        <div className="catalog-check">
                          {isSelected(item.id) ? "✓" : ""}
                        </div>
                        <div className="catalog-info">
                          <div className="catalog-name">{item.name}</div>
                          <div className="catalog-meta">
                            <span className="budget-tag">{item.item_code}</span>
                            <span className="catalog-unit">per {item.unit}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Selected items with quantity */}
                {selectedItems.length > 0 && (
                  <div className="nrm-selected">
                    <div className="nrm-selected-title">Selected Items</div>
                    {selectedItems.map(item => (
                      <div key={item.supplier_item_id} className="nrm-selected-item">
                        <div className="selected-info">
                          <div className="selected-name">{item.name}</div>
                          <div className="selected-code">{item.item_code}</div>
                        </div>
                        <div className="selected-qty">
                          <button className="qty-btn"
                            type="button"
                            onClick={() => updateQuantity(item.supplier_item_id, item.quantity - 1)}>
                            −
                          </button>
                          <input
                            className="qty-input"
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => updateQuantity(item.supplier_item_id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                          />
                          <button className="qty-btn"
                            type="button"
                            onClick={() => updateQuantity(item.supplier_item_id, item.quantity + 1)}>
                            +
                          </button>
                        </div>
                        <button className="remove-item-btn" type="button"
                          onClick={() => removeItem(item.supplier_item_id)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}