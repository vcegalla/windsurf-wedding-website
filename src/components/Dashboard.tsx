import { useEffect, useRef, useState } from 'react'
import { MapPin, Users, CheckCircle, Menu, X } from 'lucide-react'
import RSVPForm from './RSVPForm'
import { lookupHouseholdByLastName, submitRSVP } from '../services/api'
import type { HouseholdRSVPData } from '../types'

type DashboardProps = {
  guestName: string
  onLogout: () => void
}

const weddingCeremonyDetails = {
  date: 'April 17, 2027',
  time: '2:00 PM',
  location: 'Cathedral of Mary Our Queen',
  address: '5200 N Charles St, Baltimore, MD 21210',
  couple: 'Elexa & Vince',
}

const weddingReceptionDetails = {
  date: 'April 17, 2027',
  time: '6:00 PM',
  location: 'George Peabody Library',
  address: '17 E Mt Vernon Pl, Baltimore, MD 21202',
  couple: 'Elexa & Vince',
}

const hotelBlock = {
  revival: {
    name: 'Hotel Revival',
    address: '101 W Monument St, Baltimore, MD 21201',
    coordinates: '39.2979, -76.6198',
    blockCode: 'TBD',
  },
  indigo: {
    name: 'Hotel Indigo',
    address: '24 W Franklin St, Baltimore, MD 21201',
    coordinates: '39.2955, -76.6178',
    blockCode: 'TBD',
  },
  homewoodSuitesInnerHarbor: {
    name: 'Homewood Suites by Balitmore (Inner Harbor)',
    address: '625 S President St, Baltimore, MD 21202',
    coordinates: '39.2845, -76.6028',
    blockCode: 'TBD',
  },
}


export default function Dashboard({ guestName, onLogout: _onLogout }: DashboardProps) {
  const [showRSVP, setShowRSVP] = useState(false)
  const [rsvpData, setRsvpData] = useState<HouseholdRSVPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [navHeight, setNavHeight] = useState(0)
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const fetchRSVP = async () => {
      const nameParts = guestName.trim().split(/\s+/)
      const inferredLastName = nameParts[nameParts.length - 1] || ''
      if (!inferredLastName) {
        setLoading(false)
        return
      }

      try {
        const data = await lookupHouseholdByLastName(inferredLastName)
        if (data) {
          setRsvpData(data)
        }
      } catch (error) {
        console.error('Failed to fetch RSVP:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRSVP()
  }, [guestName])

  useEffect(() => {
    const updateNavHeight = () => {
      if (!headerRef.current) {
        return
      }
      setNavHeight(headerRef.current.getBoundingClientRect().height)
    }

    updateNavHeight()
    window.addEventListener('resize', updateNavHeight)

    const observer = new ResizeObserver(() => {
      updateNavHeight()
    })

    if (headerRef.current) {
      observer.observe(headerRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateNavHeight)
      observer.disconnect()
    }
  }, [])

  const handleRSVPSubmit = async (data: HouseholdRSVPData) => {
    try {
      const result = await submitRSVP(data)
      setRsvpData(result.data)
      setShowRSVP(false)
    } catch (error) {
      console.error('Failed to submit RSVP:', error)
      alert('Failed to submit RSVP. Please try again.')
    }
  }

  const handleLookup = async (lastName: string, isFirstSearch: boolean) => {
    try {
      const data = await lookupHouseholdByLastName(lastName, isFirstSearch)
      return data
    } catch (error) {
      console.error('Failed to look up RSVP household:', error)
      return null
    }
  }

  const guestNameParts = guestName.trim().split(/\s+/)
  const inferredLastName = guestNameParts[guestNameParts.length - 1] || ''
  const sectionMinHeight = navHeight > 0 ? `calc(100dvh - ${navHeight}px)` : '100dvh'
  const hotelCoordinatesQuery = Object.values(hotelBlock)
    .map((hotel) => hotel.coordinates)
    .join('|')
  const baltimoreCenter = '39.2904,-76.6122'

  const householdHasResponses = rsvpData && rsvpData.people.length > 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header ref={headerRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-gray-100">
        <div className="responsive-container py-3 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNavOpen((prev) => !prev)}
              className="sm:hidden inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition"
              aria-label="Toggle navigation menu"
              aria-expanded={isNavOpen}
            >
              {isNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <nav className={`responsive-container pb-3 ${isNavOpen ? 'block' : 'hidden sm:block'}`}>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
            <li><a href="#landing" className="hover:text-primary-700 transition" onClick={() => setIsNavOpen(false)}>Landing</a></li>
            <li><a href="#eventDetails" className="hover:text-primary-700 transition" onClick={() => setIsNavOpen(false)}>Event Details</a></li>
            <li><a href="#rsvp" className="hover:text-primary-700 transition" onClick={() => setIsNavOpen(false)}>RSVP</a></li>
            <li><a href="#weddingParty" className="hover:text-primary-700 transition" onClick={() => setIsNavOpen(false)}>Wedding Party</a></li>
            <li><a href="#accomodations" className="hover:text-primary-700 transition" onClick={() => setIsNavOpen(false)}>Accomodations</a></li>
            <li><a href="#registry" className="hover:text-primary-700 transition" onClick={() => setIsNavOpen(false)}>Registry</a></li>
          </ul>
        </nav>
      </header>

      <section id="landing" className="scroll-mt-32 bg-gradient-to-r from-primary-600 to-purple-600 text-white responsive-section flex items-center" style={{ minHeight: sectionMinHeight }}>
        <div className="responsive-container text-center w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">{weddingCeremonyDetails.couple}</h1>
          <p className="text-lg sm:text-xl mb-1 sm:mb-2">Request the pleasure of your company</p>
          <p className="text-base sm:text-lg opacity-90">at their wedding celebration</p>
        </div>
      </section>

      <section id="eventDetails" className="scroll-mt-32 responsive-section flex items-center" style={{ minHeight: sectionMinHeight }}>
        <div className="responsive-container w-full space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">Event Details</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="responsive-card text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Ceremony</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium text-gray-800">Date:</span> {weddingCeremonyDetails.date}</p>
                <p><span className="font-medium text-gray-800">Time:</span> {weddingCeremonyDetails.time}</p>
                <p><span className="font-medium text-gray-800">Location:</span> {weddingCeremonyDetails.location}</p>
                <p><span className="font-medium text-gray-800">Address:</span> {weddingCeremonyDetails.address}</p>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(weddingCeremonyDetails.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 sm:px-6 py-3 rounded-lg hover:bg-primary-700 transition mt-5"
              >
                <MapPin className="w-4 h-4" />
                View Ceremony Map
              </a>
            </div>

            <div className="responsive-card text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Reception</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium text-gray-800">Date:</span> {weddingReceptionDetails.date}</p>
                <p><span className="font-medium text-gray-800">Time:</span> {weddingReceptionDetails.time}</p>
                <p><span className="font-medium text-gray-800">Location:</span> {weddingReceptionDetails.location}</p>
                <p><span className="font-medium text-gray-800">Address:</span> {weddingReceptionDetails.address}</p>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(weddingReceptionDetails.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 sm:px-6 py-3 rounded-lg hover:bg-primary-700 transition mt-5"
              >
                <MapPin className="w-4 h-4" />
                View Reception Map
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="rsvp" className="scroll-mt-32 responsive-section flex items-center" style={{ minHeight: sectionMinHeight }}>
        <div className="responsive-container w-full">
          <div className="responsive-card">
          <div className="text-center mb-6">
            <Users className="w-12 h-12 text-primary-600 mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">RSVP</h2>
            <p className="text-gray-600">
              {householdHasResponses ? (
                <span className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Your RSVP has been submitted!
                </span>
              ) : (
                'Please search by last name and RSVP for each person in your household'
              )}
            </p>
          </div>

          {householdHasResponses ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-3">Household RSVP Details</h3>
              <p className="text-sm text-green-900 mb-3">
                Last Name: <span className="font-medium">{rsvpData.lastName}</span>
              </p>
              <div className="space-y-3 text-sm">
                {rsvpData.people.map((person) => (
                  <div key={person.name} className="bg-white rounded-lg border border-green-200 p-3">
                    <p><span className="font-medium">Name:</span> {person.name}</p>
                    <p><span className="font-medium">Ceremony:</span> {person.ceremonyAttending ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Reception:</span> {person.receptionAttending ? 'Yes' : 'No'}</p>
                    {person.dietary && <p><span className="font-medium">Dietary:</span> {person.dietary}</p>}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowRSVP(true)}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Update RSVP
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRSVP(true)}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Find Household RSVP
            </button>
          )}
        </div>
        </div>
      </section>

      <section id="weddingParty" className="scroll-mt-32 responsive-section flex items-center" style={{ minHeight: sectionMinHeight }}>
        <div className="responsive-container w-full">
          <div className="responsive-card text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Wedding Party</h2>
            <p className="text-gray-600">Wedding party details coming soon.</p>
          </div>
        </div>
      </section>

      <section id="accomodations" className="scroll-mt-32 responsive-section flex items-center" style={{ minHeight: sectionMinHeight }}>
        <div className="responsive-container w-full">
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <div className="responsive-card">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Accomodations</h2>
              <div className="space-y-4">
                {Object.values(hotelBlock).map((hotel) => (
                  <div key={hotel.name} className="border border-gray-200 rounded-lg p-4 text-gray-700">
                    <p className="font-semibold text-gray-800">{hotel.name}</p>
                    <p className="text-sm">Address: {hotel.address}</p>
                    <p className="text-sm">Block Code: {hotel.blockCode}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="responsive-card p-0 overflow-hidden">
              <iframe
                title="Hotel block map"
                src={`https://www.google.com/maps?output=embed&ll=${encodeURIComponent(baltimoreCenter)}&z=12&q=${encodeURIComponent(hotelCoordinatesQuery)}`}
                className="w-full h-full min-h-[320px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="registry" className="scroll-mt-32 responsive-section flex items-center" style={{ minHeight: sectionMinHeight }}>
        <div className="responsive-container w-full">
          <div className="responsive-card text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Registry</h2>
            <p className="text-gray-600">Registry details coming soon.</p>
          </div>
        </div>
      </section>

      {showRSVP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="responsive-modal">
            <RSVPForm
              initialData={rsvpData}
              initialLastName={inferredLastName}
              onLookup={handleLookup}
              onSubmit={handleRSVPSubmit}
              onCancel={() => setShowRSVP(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
