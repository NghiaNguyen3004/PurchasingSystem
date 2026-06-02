const statusColors = {
  Pending:  { bg: "rgba(234,179,8,0.12)",  text: "#fbbf24", dot: "#f59e0b" },
  Approved: { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", dot: "#22c55e" },
  Rejected: { bg: "rgba(239,68,68,0.12)",  text: "#f87171", dot: "#ef4444" },
};

export default function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: c.bg, color: c.text,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}