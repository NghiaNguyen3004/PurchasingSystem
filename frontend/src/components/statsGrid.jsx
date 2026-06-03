export default function StatsGrid({ stats }) {
    return (
        <div className = "stats-grid">
            {stats.map((stat) =>(
            <div className="stat-card" key={stat.label} style={{ "--accent": stat.accent }}>
                <div className="stat-value" style={{ color: stat.accent }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
            </div>
            ))}
        </div>
    )
}