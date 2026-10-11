import CollectionPage from './CollectionPage.jsx'
import useCollection from '../hooks/useCollection.js'

const columns = [
  { key: 'type', label: 'Activity' },
  { key: 'user', label: 'Athlete' },
  { key: 'durationMinutes', label: 'Duration', render: (value) => value == null ? '—' : `${value} min` },
  { key: 'distanceKm', label: 'Distance', render: (value) => value == null ? '—' : `${value} km` },
  { key: 'points', label: 'Points' },
  { key: 'performedAt', label: 'Date', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
]

export default function Activities() {
  const { items, loading, error } = useCollection('/api/activities/', fetch)

  return (
    <CollectionPage
      columns={columns}
      description="A community snapshot of movement, training, and consistency."
      error={error}
      items={items}
      loading={loading}
      title="Activities"
    />
  )
}
