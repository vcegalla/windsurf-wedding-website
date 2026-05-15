import { useEffect, useState } from 'react'
import { Calendar, MapPin, Users, LogOut, Heart, Clock, CheckCircle } from 'lucide-react'
import RSVPForm from './RSVPForm'
import { getRSVP, submitRSVP } from '../services/api'
import type { RSVPData } from '../types'

type DashboardProps = {
  guestName: string
  onLogout: () => void
}

const weddingDetails = {
  date: 'June 15, 2026',
  time: '4:00 PM',
  location: 'Grand Garden Estate',
  address: '123 Wedding Lane, Celebration City',
  couple: 'Sarah & Michael',
}

export default function Dashboard({ guestName, onLogout }: DashboardProps) {
  const [showRSVP, setShowRSVP] = useState(false)
  const [rsvpData, setRsvpData] = useState<RSVPData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRSVP = async () => {
      try {
        const data = await getRSVP(guestName)
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

  const handleRSVPSubmit = async (data: RSVPData) => {
    try {
      await submitRSVP(data)
      setRsvpData(data)
      setShowRSVP(false)
    } catch (error) {
      console.error('Failed to submit RSVP:', error)
      alert('Failed to submit RSVP. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-600" />
            <span className="font-semibold text-gray-800">{weddingDetails.couple}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{weddingDetails.couple}</h1>
          <p className="text-xl mb-2">Request the pleasure of your company</p>
          <p className="text-lg opacity-90">at their wedding celebration</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Calendar className="w-10 h-10 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Date</h3>
            <p className="text-gray-600">{weddingDetails.date}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Clock className="w-10 h-10 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Time</h3>
            <p className="text-gray-600">{weddingDetails.time}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <MapPin className="w-10 h-10 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
            <p className="text-gray-600">{weddingDetails.location}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Venue Details</h2>
          <p className="text-gray-600 text-center mb-4">{weddingDetails.address}</p>
          <div className="text-center">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(weddingDetails.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-6">
            <Users className="w-12 h-12 text-primary-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">RSVP</h2>
            <p className="text-gray-600">
              {rsvpData ? (
                <span className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Your RSVP has been submitted!
                </span>
              ) : (
                'Please let us know if you can attend'
              )}
            </p>
          </div>

          {rsvpData ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-3">Your RSVP Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {rsvpData.name}</p>
                <p><span className="font-medium">Attending:</span> {rsvpData.attending ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Guests:</span> {rsvpData.guests}</p>
                {rsvpData.dietary && <p><span className="font-medium">Dietary Requirements:</span> {rsvpData.dietary}</p>}
                {rsvpData.message && <p><span className="font-medium">Message:</span> {rsvpData.message}</p>}
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
              Submit RSVP
            </button>
          )}
        </div>
      </section>

      {showRSVP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <RSVPForm
              initialData={rsvpData || { name: guestName, attending: true, guests: 1, dietary: '', message: '' }}
              onSubmit={handleRSVPSubmit}
              onCancel={() => setShowRSVP(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
