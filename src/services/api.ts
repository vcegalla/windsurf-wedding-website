import type { AuthResponse, RSVPData } from '../types'

const API_URL = (import.meta.env.VITE_AWS_API_GATEWAY_URL || '').replace(/\/$/, '')

type ApiErrorPayload = {
  error?: string
}

const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  let payload: T | ApiErrorPayload | null = null
  try {
    payload = (await response.json()) as T | ApiErrorPayload
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message = (payload as ApiErrorPayload | null)?.error || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload as T
}

export const authenticateGuest = async ({ guestName, password }: { guestName: string; password: string }): Promise<AuthResponse> => {
  if (!API_URL) {
    const localPassword = import.meta.env.VITE_WEDDING_PASSWORD || 'wedding2026'
    if (password !== localPassword) {
      throw new Error('Incorrect password. Please try again.')
    }

    return {
      authenticated: true,
      guestName: guestName.trim(),
    }
  }

  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ guestName, password }),
  })
}

export const submitRSVP = async (rsvpData: RSVPData): Promise<{ success: true; data: RSVPData }> => {
  if (!API_URL) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: rsvpData })
      }, 1000)
    })
  }

  const result = await apiRequest<{ data: RSVPData }>('/rsvp', {
    method: 'POST',
    body: JSON.stringify(rsvpData),
  })

  return { success: true, data: result.data }
}

export const getRSVP = async (name: string): Promise<RSVPData | null> => {
  if (!API_URL) {
    return null
  }

  try {
    const result = await apiRequest<{ data: RSVPData }>(`/rsvp?name=${encodeURIComponent(name)}`, {
      method: 'GET',
    })
    return result.data
  } catch {
    return null
  }
}
