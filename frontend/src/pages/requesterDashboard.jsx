import { useState, useEffect } from "react";

import "../styles/requesterDashboard.css";
import "../styles/shared.css";
import "../styles/filterModal.css";
import "../styles/keyboardShortcuts.css"

import NewRequestModal from "../components/NewRequestModal.jsx";
import FiltersModal from "../components/FiltersModal.jsx";
import StatusBadge from "../components/statusBadge.jsx";
import SideBar from "../components/sideBar.jsx";
import StatsGrid from "../components/statsGrid.jsx";
import PageTable from "../components/pageTable.jsx";

import {useKeyboardShortcuts} from "../hook/useKeyboardShortcuts.js"
import { useRequest } from "../hook/useRequest.js";
import { useAuth } from "../context/authContext.jsx";


export default function RequesterDashboard() {
  const { token, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const {requests, loading, fetchRequests, submitNewRequest} = useRequest(token)

  const [filters, setFilters] = useState({ 
    status: "All", 
    dateFrom: "",
    dateTo:"", 
  });

  const filteredRequests = requests.filter(r => {
      const statusMatch = filters.status === "All" || r.status === filters.status

      const created = new Date(r.created_at)
      const from = filters.dateFrom ? new Date(filters.dateFrom) : null
      const to = filters.dateTo ? new Date(filters.dateTo) : null

      const dateMatch =
        (!from || created >= from) &&
        (!to || created <= to)

      return statusMatch && dateMatch
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "Pending").length,
    approved: requests.filter(r => r.status === "Approved").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
    totalValue: requests.reduce((sum, r) => sum + (r.quantity * r.price_per_unit), 0)
  };


  useKeyboardShortcuts([
    { key: "n", fn: () => setShowModal(true) },
    { key: "N", fn: () => setShowModal(true) },
    { key: "f", fn: () => setShowFilter(true) },
    { key: "F", fn: () => setShowFilter(true) },
  ])

  return (
    <div className="dash-root">
      {/* Sidebar */}
      <SideBar onAction={(action) =>{
      if (action === "newRequest") setShowModal(true);
      }}/>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-topbar">
          <h1 className="dash-title">My Requests</h1>
          <div className="topbar-actions">
            <button className="btn-filter" onClick={() => setShowFilter(true)}>
              ⚙ Filter
              <kbd className="kbd">F</kbd>
              {/* show a dot if any filter is active */}
              {(filters.status !== "All" || filters.dateFrom || filters.dateTo) && (
                <span className="filter-dot" />
              )}
            </button>

            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <span>＋</span> New Request
              <kbd className="kbd">N</kbd>
            </button>
          </div>
          
        </div>

        {/* Stats */}
        <StatsGrid stats={[
            { label: "Total Requests", value: stats.total, accent: "#6366f1" },
            { label: "Pending Review", value: stats.pending, accent: "#f59e0b" },
            { label: "Approved", value: stats.approved, accent: "#22c55e" },
            { label: "Rejected", value: stats.rejected, accent: "#ef4444" },
          ]} />

        {/* Table */}
        <PageTable
          title="Request History"
          loading={loading}
          empty={filteredRequests.length === 0 ? "No recent requests found." : null}
        > 
        <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Budget Code</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
        </thead>
        <tbody>
          {filteredRequests.map((r) => (
            <tr key={r.id}>
              <td className="td-item">{r.item_name}</td>
              <td>{r.quantity}</td>
              <td>${Number(r.price_per_unit).toLocaleString()}</td>
              <td className="td-total">${(r.quantity * r.price_per_unit).toLocaleString()}</td>
              <td><span className="budget-tag">{r.budget_code}</span></td>
              <td><StatusBadge status={r.status} /></td>
              <td className="td-date">{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>

          ))}
        </tbody>
        </PageTable>
      </main>

      {showModal && <NewRequestModal onClose={() => setShowModal(false)} onSubmit={submitNewRequest} />}
      {showFilter && <FiltersModal filters={filters} onApply={setFilters} onClose={() => setShowFilter(false)}/>}
    </div>
  );
}