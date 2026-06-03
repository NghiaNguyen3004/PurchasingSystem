import {useAuth} from '../context/authContext';

const navItems = {
  Requester: [
    { icon: "▦", label: "Dashboard", action: null },
    { icon: "＋", label: "New Request", action: "newRequest" },
  ],
  Approver: [
    { icon: "▦", label: "Dashboard", action: null },
  ],
  Admin: [
    { icon: "◈", label: "User Management", action: null },
  ],
}

const roleColors = {
  Requester: "#818cf8",
  Approver:  "#4ade80",
  Admin:     "#f87171",
}

export default function SideBar({onAction}){
    const {user, logout} = useAuth();
    const role = user?.userType || "Requester";
    const items = navItems[role] || [];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="logo-icon">⬡</span>
                <span className="logo-text">Flow</span>
            </div>
            <nav className="sidebar-nav">
                {items.map((item)=>(
                    <a
                        key={item.label}
                        className={`nav-item ${item.action === null ? "nav-active" : ""}`}
                        href="#"
                        onClick={() => item.action && onAction?.(item.action)}
                    >
                        <span className="nav-icon">{item.icon}</span> {item.label}<kbd className="kbd">{item.action === "newRequest" ? "N" :""}</kbd>
                    </a>
                ))}
            </nav>
            <div className="sidebar-user">
                <div className={`avatar ${role === "Admin" ? "admin" : ""}`}>
                        {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="user-info">
                    <div className="user-name">{user?.username}</div>
                    <div className="user-role" style={{ color: roleColors[role] }}>
                        {role}
                    </div>
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
            </div>
      </aside>
    )
}