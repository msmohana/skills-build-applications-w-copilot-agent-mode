import CollectionPage from './CollectionPage.jsx'
import useCollection from '../hooks/useCollection.js'

const columns = [
  { key: 'title', label: 'Workout' },
  { key: 'category', label: 'Category' },
  { key: 'difficulty', label: 'Level' },
  { key: 'durationMinutes', label: 'Duration', render: (value) => value == null ? '—' : `${value} min` },
  { key: 'exercises', label: 'Exercises', render: (value) => Array.isArray(value) ? value.length : '—' },
]

export default function Workouts() {
  const { items, loading, error } = useCollection('/api/workouts/', fetch)

  return (
    <CollectionPage
      columns={columns}
      description="A little inspiration for your next training session."
      error={error}
      items={items}
      loading={loading}
      title="Workouts"
    />
  )
}
