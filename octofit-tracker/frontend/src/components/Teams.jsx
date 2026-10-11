import CollectionPage from './CollectionPage.jsx'
import useCollection from '../hooks/useCollection.js'

const columns = [
  { key: 'name', label: 'Team' },
  { key: 'description', label: 'About' },
  { key: 'members', label: 'Members', render: (value) => Array.isArray(value) ? value.length : '—' },
]

export default function Teams() {
  const { items, loading, error } = useCollection('/api/teams/', fetch)

  return (
    <CollectionPage
      columns={columns}
      description="Find the people who make every mile more fun."
      error={error}
      items={items}
      loading={loading}
      title="Teams"
    />
  )
}
