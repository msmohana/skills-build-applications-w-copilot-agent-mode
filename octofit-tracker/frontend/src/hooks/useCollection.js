import { useEffect, useState } from 'react'
import { API_BASE_URL, normalizeCollectionResponse } from '../api.js'

export default function useCollection(endpoint, fetcher) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadCollection() {
      setLoading(true)
      setError('')

      try {
        const response = await fetcher(`${API_BASE_URL}${endpoint}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`The request failed with status ${response.status}.`)
        }

        const payload = await response.json()
        setItems(normalizeCollectionResponse(payload))
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load this collection.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadCollection()
    return () => controller.abort()
  }, [endpoint, fetcher])

  return { items, loading, error }
}
