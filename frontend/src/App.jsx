import { useState, useEffect } from "react";
import Login from "./pages/Login";
import RequesterDashboard from "./pages/requesterDashboard";
// import ApproverDashboard from "./ApproverDashboard"; // coming next
 
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}
 
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");
    return t ? parseJwt(t) : null;
  });
 
  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(parseJwt(newToken));
  };
 
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };
 
  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }
 
  if (user.userType === "Requester") {
    return <RequesterDashboard token={token} user={user} onLogout={handleLogout} />;
  }
 
  if (user.userType === "Approver") {
    // return <ApproverDashboard token={token} user={user} onLogout={handleLogout} />;
    return <div style={{ color: "#fff", padding: 40 }}>Approver dashboard coming soon...</div>;
  }
 
  return <Login onLogin={handleLogin} />;
}