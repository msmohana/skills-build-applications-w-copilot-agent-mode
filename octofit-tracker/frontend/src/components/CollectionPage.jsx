function formatCell(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(formatCell).join(', ') : '—'
  }

  if (typeof value === 'object') {
    if (value.displayName || value.name || value.title || value.email) {
      return value.displayName || value.name || value.title || value.email
    }
    if (value._id) {
      return value._id
    }
    return JSON.stringify(value)
  }

  return String(value)
}

function getValue(item, key) {
  return key.split('.').reduce((value, segment) => value?.[segment], item)
}

export default function CollectionPage({ title, description, items, columns, loading, error }) {
  return (
    <section className="collection-page">
      <div className="collection-heading">
        <div>
          <p className="eyebrow">OCTOFIT TRACKER</p>
          <h1>{title}</h1>
          <p className="collection-description">{description}</p>
        </div>
        <span className="collection-count">
          {loading ? 'Loading' : `${items.length} ${items.length === 1 ? 'record' : 'records'}`}
        </span>
      </div>

      {loading && (
        <div aria-live="polite" className="status-panel">
          <span aria-hidden="true" className="spinner-border spinner-border-sm text-primary" />
          <span>Loading {title.toLowerCase()}…</span>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-warning" role="alert">
          <strong>Couldn’t load {title.toLowerCase()}.</strong> {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="status-panel empty-state">
          <span aria-hidden="true">◎</span>
          <strong>No {title.toLowerCase()} to show yet</strong>
          <span>Check back after more tracker data has been added.</span>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-responsive collection-table-wrap">
          <table className="table collection-table align-middle">
            <thead>
              <tr>
                {columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item._id || item.id || `${title}-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(getValue(item, column.key), item)
                        : formatCell(getValue(item, column.key))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
