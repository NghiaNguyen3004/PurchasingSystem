import { useState, useEffect } from "react";
import Login from "./pages/Login";
import RequesterDashboard from "./pages/RequesterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./context/authContext.jsx";
// import ApproverDashboard from "./ApproverDashboard"; // coming next

 
export default function App() {
  const { token, user, login, logout } = useAuth();

 
  if (!token || !user) {
    return <Login onLogin={login} />;
  }
 
  if (user.userType === "Requester") {
    return <RequesterDashboard token={token} user={user} onLogout={logout} />;
  }
 
  if (user.userType === "Approver") {
    // return <ApproverDashboard token={token} user={user} onLogout={logout} />;
    return <div style={{ color: "#fff", padding: 40 }}>Approver dashboard coming soon...</div>;
  }

  if (user.userType === "Admin") {
    return <AdminDashboard token={token} user={user} onLogout={logout} />;
  }
 
  return <Login onLogin={login} />;
}