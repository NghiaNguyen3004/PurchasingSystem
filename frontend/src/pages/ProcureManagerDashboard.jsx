import { useState, useEffect } from "react"
import { useAuth } from "../context/authContext.jsx"
import { useRequest } from "../hook/useRequest.js"
import SideBar from "../components/sideBar.jsx"
import StatsGrid from "../components/StatsGrid.jsx"
import PageTable from "../components/pageTable.jsx"
import StatusBadge from "../components/statusBadge.jsx"
import RequestDetailModal from "../components/RequestDetailModal.jsx"
import {
  getRequestTypes,
  getSuppliersByType,
  getItemsBySupplier,
  addSupplier,
  editSupplier,
  removeSupplier,
  addSupplierItem,
  editSupplierItem,
  removeSupplierItem,
  priceRequestItems,
} from "../services/api.js"
import "../styles/ProcureDashboard.css"
import "../styles/shared.css"

// ── Small reusable modal ──────────────────────────────────────────────────────
function SmallModal({ title, onClose, children }) {
  return (
    <div className="sm-overlay" onClick={onClose}>
      <div className="sm-card" onClick={e => e.stopPropagation()}>
        <div className="sm-header">
          <h3 className="sm-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Approved Requests View ────────────────────────────────────────────────────
function ApprovedRequestsView() {
  const { token } = useAuth()
  const { requests, loading, fetchApproved, setProcessingStatus, complete } = useRequest(token)
  const [statusFilter, setStatusFilter]   = useState("Approved")
  const [viewingIndex, setViewingIndex]   = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchApproved() }, [])

  const filteredRequests = requests.filter(r =>
    statusFilter === "All" || r.status === statusFilter
  )

  const handleSetProcessing = async (id) => {
    setActionLoading(id)
    try { await setProcessingStatus(id); fetchApproved() }
    finally { setActionLoading(null) }
  }

  const handleComplete = async (id) => {
    setActionLoading(id)
    try { await complete(id); fetchApproved() }
    finally { setActionLoading(null) }
  }

  const stats = {
    total:      requests.length,
    approved:   requests.filter(r => r.status === "Approved").length,
    processing: requests.filter(r => r.status === "Processing").length,
    completed:  requests.filter(r => r.status === "Completed").length,
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1 className="dash-title">Approved Requests</h1>
          <p className="dash-sub">Price, process and complete purchase requests</p>
        </div>
        <div className="filter-bar">
          {["All", "Approved", "Processing", "Completed"].map(s => (
            <button key={s}
              className={`filter-btn ${statusFilter === s ? "filter-active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >{s}</button>
          ))}
        </div>
      </div>

      <StatsGrid stats={[
        { label: "Total",      value: stats.total,      accent: "#6366f1" },
        { label: "Approved",   value: stats.approved,   accent: "#f59e0b" },
        { label: "Processing", value: stats.processing, accent: "#818cf8" },
        { label: "Completed",  value: stats.completed,  accent: "#22c55e" },
      ]} />

      <PageTable
        title={`${statusFilter} Requests`}
        loading={loading}
        empty={filteredRequests.length === 0 ? `No ${statusFilter.toLowerCase()} requests.` : null}
      >
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Type</th>
            <th>Requested By</th>
            <th>Department</th>
            <th>Budget Code</th>
            <th>Status</th>
            <th>Delivery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((r, index) => {
            const isLoading = actionLoading === r.id
            return (
              <tr key={r.id}>
                <td className="td-item">
                  <div className="supplier-cell">
                    <div className="supplier-avatar">{r.supplier_name?.[0]?.toUpperCase()}</div>
                    {r.supplier_name}
                  </div>
                </td>
                <td><span className="type-tag">{r.request_type_name}</span></td>
                <td>
                  <div className="requester-info">
                    <div className="requester-avatar">{r.requester?.[0]?.toUpperCase()}</div>
                    {r.requester}
                  </div>
                </td>
                <td>{r.department}</td>
                <td><span className="budget-tag">{r.budget_code}</span></td>
                <td><StatusBadge status={r.status} /></td>
                <td className="td-date">{r.expected_delivery}</td>
                <td>
                  <div className="action-btns">
                    <button className="view-btn" onClick={() => setViewingIndex(index)}>
                      View
                    </button>
                    {r.status === "Approved" && (
                      <button className="processing-btn" onClick={() => handleSetProcessing(r.id)} disabled={isLoading}>
                        {isLoading ? "..." : "⟳ Process"}
                      </button>
                    )}
                    {r.status === "Processing" && (
                      <button className="complete-btn" onClick={() => handleComplete(r.id)} disabled={isLoading}>
                        {isLoading ? "..." : "✓ Complete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </PageTable>

      {viewingIndex !== null && (
        <RequestDetailModal
          requests={filteredRequests}
          currentIndex={viewingIndex}
          onClose={() => setViewingIndex(null)}
          onApprove={null}
          onReject={null}
          onSetProcessing={handleSetProcessing}
          onComplete={handleComplete}
          showPricing={true}
          token={token}
        />
      )}
    </>
  )
}

// ── Supplier Catalog View ─────────────────────────────────────────────────────
function SupplierCatalogView() {
  const { token } = useAuth()

  const [requestTypes, setRequestTypes]         = useState([])
  const [selectedTypeId, setSelectedTypeId]     = useState(null)
  const [suppliers, setSuppliers]               = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [items, setItems]                       = useState([])

  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [loadingItems, setLoadingItems]         = useState(false)

  // modals
  const [supplierModal, setSupplierModal] = useState(null)  // null | "add" | supplier object
  const [itemModal, setItemModal]         = useState(null)  // null | "add" | item object

  // forms
  const [supplierForm, setSupplierForm] = useState({ name: "", request_type_id: "" })
  const [itemForm, setItemForm]         = useState({ item_code: "", name: "", unit: "", price_per_unit: "" })
  const [formLoading, setFormLoading]   = useState(false)
  const [formError, setFormError]       = useState("")

  // load request types
  useEffect(() => {
    getRequestTypes(token).then(types => {
      setRequestTypes(types)
      if (types.length > 0) setSelectedTypeId(types[0].id)
    })
  }, [])

  // load suppliers when type changes
  useEffect(() => {
    if (!selectedTypeId) return
    setLoadingSuppliers(true)
    setSelectedSupplier(null)
    setItems([])
    getSuppliersByType(token, selectedTypeId)
      .then(setSuppliers)
      .finally(() => setLoadingSuppliers(false))
  }, [selectedTypeId])

  // load items when supplier selected
  useEffect(() => {
    if (!selectedSupplier) return
    setLoadingItems(true)
    getItemsBySupplier(token, selectedSupplier.id)
      .then(setItems)
      .finally(() => setLoadingItems(false))
  }, [selectedSupplier])

  const refreshSuppliers = async () => {
    const data = await getSuppliersByType(token, selectedTypeId)
    setSuppliers(data)
  }

  const refreshItems = async () => {
    if (!selectedSupplier) return
    const data = await getItemsBySupplier(token, selectedSupplier.id)
    setItems(data)
  }

  // ── Supplier CRUD ──
  const openAddSupplier = () => {
    setSupplierForm({ name: "", request_type_id: selectedTypeId })
    setFormError("")
    setSupplierModal("add")
  }

  const openEditSupplier = (supplier) => {
    setSupplierForm({ name: supplier.name, request_type_id: supplier.request_type_id })
    setFormError("")
    setSupplierModal(supplier)
  }

  const handleSupplierSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    try {
      if (supplierModal === "add") {
        await addSupplier(token, supplierForm)
      } else {
        await editSupplier(token, supplierModal.id, supplierForm)
        if (selectedSupplier?.id === supplierModal.id) {
          setSelectedSupplier(prev => ({ ...prev, ...supplierForm }))
        }
      }
      await refreshSuppliers()
      setSupplierModal(null)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteSupplier = async (supplier) => {
    if (!confirm(`Delete supplier "${supplier.name}"? This cannot be undone.`)) return
    try {
      await removeSupplier(token, supplier.id)
      if (selectedSupplier?.id === supplier.id) setSelectedSupplier(null)
      await refreshSuppliers()
    } catch (err) {
      alert(err.message)
    }
  }

  // ── Item CRUD ──
  const openAddItem = () => {
    setItemForm({ item_code: "", name: "", unit: "", price_per_unit: "" })
    setFormError("")
    setItemModal("add")
  }

  const openEditItem = (item) => {
    setItemForm({
      item_code:     item.item_code,
      name:          item.name,
      unit:          item.unit,
      price_per_unit: item.price_per_unit ?? "",
    })
    setFormError("")
    setItemModal(item)
  }

  const handleItemSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    try {
      const payload = {
        ...itemForm,
        price_per_unit: itemForm.price_per_unit || null,
      }
      if (itemModal === "add") {
        await addSupplierItem(token, selectedSupplier.id, payload)
      } else {
        await editSupplierItem(token, itemModal.id, payload)
      }
      await refreshItems()
      setItemModal(null)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteItem = async (item) => {
    if (!confirm(`Delete item "${item.name}"?`)) return
    try {
      await removeSupplierItem(token, item.id)
      await refreshItems()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1 className="dash-title">Supplier Catalog</h1>
          <p className="dash-sub">Manage suppliers and their item catalog</p>
        </div>

        {/* Request type filter */}
        <div className="filter-bar">
          {requestTypes.map(t => (
            <button key={t.id}
              className={`filter-btn ${selectedTypeId === t.id ? "filter-active" : ""}`}
              onClick={() => setSelectedTypeId(t.id)}
            >{t.name}</button>
          ))}
        </div>
      </div>

      <div className="catalog-layout">

        {/* Left — Suppliers */}
        <div className="catalog-panel">
          <div className="catalog-panel-header">
            <span className="catalog-panel-title">Suppliers</span>
            <button className="btn-primary btn-sm" onClick={openAddSupplier}>＋ Add</button>
          </div>

          <div className="catalog-list">
            {loadingSuppliers ? (
              <div className="catalog-empty">Loading...</div>
            ) : suppliers.length === 0 ? (
              <div className="catalog-empty">No suppliers for this type</div>
            ) : (
              suppliers.map(s => (
                <div
                  key={s.id}
                  className={`catalog-list-item ${selectedSupplier?.id === s.id ? "item-selected" : ""}`}
                  onClick={() => setSelectedSupplier(s)}
                >
                  <div className="catalog-item-info">
                    <div className="catalog-item-avatar">{s.name[0].toUpperCase()}</div>
                    <span className="catalog-item-name">{s.name}</span>
                  </div>
                  <div className="catalog-item-actions">
                    <button className="icon-btn edit-icon" onClick={e => { e.stopPropagation(); openEditSupplier(s) }}>✎</button>
                    <button className="icon-btn delete-icon" onClick={e => { e.stopPropagation(); handleDeleteSupplier(s) }}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — Items */}
        <div className="catalog-panel">
          <div className="catalog-panel-header">
            <span className="catalog-panel-title">
              {selectedSupplier ? `${selectedSupplier.name} — Items` : "Select a supplier"}
            </span>
            {selectedSupplier && (
              <button className="btn-primary btn-sm" onClick={openAddItem}>＋ Add Item</button>
            )}
          </div>

          <div className="catalog-list">
            {!selectedSupplier ? (
              <div className="catalog-empty">
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>◈</div>
                <p>Select a supplier to view its catalog</p>
              </div>
            ) : loadingItems ? (
              <div className="catalog-empty">Loading items...</div>
            ) : items.length === 0 ? (
              <div className="catalog-empty">No items yet — add one!</div>
            ) : (
              items.map(item => (
                <div key={item.id} className="catalog-list-item">
                  <div className="catalog-item-detail">
                    <div className="catalog-item-row">
                      <span className="catalog-item-name">{item.name}</span>
                      <span className="catalog-item-price">
                        {item.price_per_unit
                          ? `$${Number(item.price_per_unit).toLocaleString()} / ${item.unit}`
                          : <span className="price-missing">No price set</span>
                        }
                      </span>
                    </div>
                    <div className="catalog-item-meta">
                      <span className="budget-tag">{item.item_code}</span>
                      <span className="catalog-item-unit">per {item.unit}</span>
                    </div>
                  </div>
                  <div className="catalog-item-actions">
                    <button className="icon-btn edit-icon" onClick={() => openEditItem(item)}>✎</button>
                    <button className="icon-btn delete-icon" onClick={() => handleDeleteItem(item)}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Supplier Modal */}
      {supplierModal && (
        <SmallModal
          title={supplierModal === "add" ? "Add Supplier" : `Edit — ${supplierModal.name}`}
          onClose={() => setSupplierModal(null)}
        >
          <form className="sm-form" onSubmit={handleSupplierSubmit}>
            <div className="field-group">
              <label className="field-label">Supplier Name</label>
              <input className="field-input" placeholder="e.g. Dell" required
                value={supplierForm.name}
                onChange={e => setSupplierForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Request Type</label>
              <select className="field-input field-select"
                value={supplierForm.request_type_id}
                onChange={e => setSupplierForm(prev => ({ ...prev, request_type_id: Number(e.target.value) }))}
                required
              >
                {requestTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="sm-actions">
              <button type="button" className="btn-secondary" onClick={() => setSupplierModal(null)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? <span className="btn-spinner" /> : supplierModal === "add" ? "Add Supplier" : "Save Changes"}
              </button>
            </div>
          </form>
        </SmallModal>
      )}

      {/* Item Modal */}
      {itemModal && (
        <SmallModal
          title={itemModal === "add" ? `Add Item to ${selectedSupplier?.name}` : `Edit — ${itemModal.name}`}
          onClose={() => setItemModal(null)}
        >
          <form className="sm-form" onSubmit={handleItemSubmit}>
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Item Code</label>
                <input className="field-input" placeholder="e.g. DELL-LAP-001" required
                  value={itemForm.item_code}
                  onChange={e => setItemForm(prev => ({ ...prev, item_code: e.target.value }))} />
              </div>
              <div className="field-group">
                <label className="field-label">Unit</label>
                <input className="field-input" placeholder="e.g. unit, box, license" required
                  value={itemForm.unit}
                  onChange={e => setItemForm(prev => ({ ...prev, unit: e.target.value }))} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Item Name</label>
              <input className="field-input" placeholder="e.g. Dell Latitude 15 Laptop" required
                value={itemForm.name}
                onChange={e => setItemForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Price per Unit ($) <span className="field-optional">optional</span></label>
              <input className="field-input" type="number" min="0" step="0.01" placeholder="0.00"
                value={itemForm.price_per_unit}
                onChange={e => setItemForm(prev => ({ ...prev, price_per_unit: e.target.value }))} />
            </div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="sm-actions">
              <button type="button" className="btn-secondary" onClick={() => setItemModal(null)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? <span className="btn-spinner" /> : itemModal === "add" ? "Add Item" : "Save Changes"}
              </button>
            </div>
          </form>
        </SmallModal>
      )}
    </>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ProcureManagerDashboard() {
  const [activeView, setActiveView] = useState("requests")

  return (
    <div className="dash-root">
      <SideBar onAction={(action) => {
        if (action === "requests") setActiveView("requests")
        if (action === "catalog")  setActiveView("catalog")
      }} />

      <main className="dash-main">
        {activeView === "requests"
          ? <ApprovedRequestsView />
          : <SupplierCatalogView />
        }
      </main>
    </div>
  )
}