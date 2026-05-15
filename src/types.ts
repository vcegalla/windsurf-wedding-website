export type RSVPData = {
  name: string
  attending: boolean
  guests: number
  dietary: string
  message: string
}

export type AuthResponse = {
  authenticated: boolean
  guestName: string
}
