export default function PageTable({ title, loading, empty, children}) {
    return (
        <div className="table-card">
          <div className="table-header">
            <h2 className="table-title">{title}</h2>
          </div>
          {loading ? (
            <div className="table-empty">Loading...</div>
          ) : empty ? (
            <div className="table-empty">
              <div className="empty-icon">◈</div>
              <p>{empty}</p>
            </div>
          ) : (
            <table className="req-table">{children}</table>
          )}
          </div>
    )
}