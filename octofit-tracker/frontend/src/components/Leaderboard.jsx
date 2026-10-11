import CollectionPage from './CollectionPage.jsx'
import useCollection from '../hooks/useCollection.js'

const columns = [
  { key: 'rank', label: 'Rank', render: (value) => value ? `#${value}` : '—' },
  { key: 'user', label: 'Athlete' },
  { key: 'team', label: 'Team' },
  { key: 'points', label: 'Points' },
  { key: 'period', label: 'Period' },
]

export default function Leaderboard() {
  const { items, loading, error } = useCollection('/api/leaderboard/', fetch)

  return (
    <CollectionPage
      columns={columns}
      description="Celebrate consistency and see how your crew is stacking up."
      error={error}
      items={items}
      loading={loading}
      title="Leaderboard"
    />
  )
}
