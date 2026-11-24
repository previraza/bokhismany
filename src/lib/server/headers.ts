import { setResponseHeaders } from '@tanstack/react-start/server'

/** Never cache authenticated admin responses in a shared proxy or browser. */
export function setPrivateHeaders(): void {
  setResponseHeaders(new Headers({ 'Cache-Control': 'no-store', Vary: 'Cookie' }))
}
