const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()

export const API_BASE_URL = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000'

export function normalizeCollectionResponse(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('The API returned an unsupported collection response.')
  }

  for (const key of ['results', 'items', 'docs', 'records', 'data']) {
    if (Array.isArray(payload[key])) {
      return payload[key]
    }
    if (payload[key] && typeof payload[key] === 'object') {
      try {
        return normalizeCollectionResponse(payload[key])
      } catch {
        // Continue checking recognized pagination envelope keys.
      }
    }
  }

  throw new Error('The API response did not contain a collection.')
}
