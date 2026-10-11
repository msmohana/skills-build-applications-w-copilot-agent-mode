import CollectionPage from './CollectionPage.jsx'
import useCollection from '../hooks/useCollection.js'

const columns = [
  { key: 'displayName', label: 'Athlete' },
  { key: 'email', label: 'Email' },
  { key: 'bio', label: 'About' },
  { key: 'team', label: 'Team' },
]

export default function Users() {
  const { items, loading, error } = useCollection('/api/users/', fetch)

  return (
    <CollectionPage
      columns={columns}
      description="Get to know the people behind the progress."
      error={error}
      items={items}
      loading={loading}
      title="Users"
    />
  )
}
