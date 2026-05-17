export type PersonRSVP = {
  name: string
  ceremonyAttending: boolean
  receptionAttending: boolean
  dietary: string
}

export type HouseholdRSVPData = {
  lastName: string
  people: PersonRSVP[]
  createdAt?: string
  updatedAt?: string
}

export type AuthResponse = {
  authenticated: boolean
  guestName: string
}
