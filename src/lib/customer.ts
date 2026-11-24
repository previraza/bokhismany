/**
 * Customer details live only in the browser. There is no customer account and
 * nothing is sent to the server except the data needed for one reservation.
 */
export const CUSTOMER_STORAGE_KEY = 'bokhismany-customer-v1'
export const REMEMBER_CUSTOMER_KEY = 'bokhismany-remember-customer-v1'

export interface StoredCustomer {
  name: string
  phone: string
}

export function readStoredCustomer(): StoredCustomer | null {
  try {
    const raw = window.localStorage.getItem(CUSTOMER_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const values = parsed as Partial<StoredCustomer>
    if (typeof values.name !== 'string' || typeof values.phone !== 'string') return null
    return { name: values.name, phone: values.phone }
  } catch {
    return null
  }
}

export function writeStoredCustomer(customer: StoredCustomer): void {
  try {
    window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer))
    window.localStorage.setItem(REMEMBER_CUSTOMER_KEY, 'true')
  } catch {
    // Storage can be disabled; the reservation still works without it.
  }
}

export function clearStoredCustomer(): void {
  try {
    window.localStorage.removeItem(CUSTOMER_STORAGE_KEY)
    window.localStorage.removeItem(REMEMBER_CUSTOMER_KEY)
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

export function shouldRememberCustomer(): boolean {
  try {
    return window.localStorage.getItem(REMEMBER_CUSTOMER_KEY) !== 'false'
  } catch {
    return false
  }
}

export function setRememberCustomer(remember: boolean): void {
  try {
    window.localStorage.setItem(REMEMBER_CUSTOMER_KEY, remember ? 'true' : 'false')
    if (!remember) window.localStorage.removeItem(CUSTOMER_STORAGE_KEY)
  } catch {
    // Storage can be disabled; the checkbox still works for this visit.
  }
}
