import { useState, useEffect } from "react";
import Login from "./pages/Login";
import RequesterDashboard from "./pages/RequesterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./context/authContext.jsx";
// import ApproverDashboard from "./ApproverDashboard"; // coming next

 
export default function App() {
  const { token, user, login } = useAuth();
  const DASHBOARDS = {
    "Requester":       <RequesterDashboard />,
    //"Approver":        <ApproverDashboard />,
    //"Procure Manager": <ProcureManagerDashboard />,
    "Admin":           <AdminDashboard />,
  }

  // in render
  if (!token || !user) return <Login onLogin={login} />
  return DASHBOARDS[user.userRole] || <Login onLogin={login} />
}