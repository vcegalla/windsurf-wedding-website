import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { HouseholdRSVPData, PersonRSVP } from '../types'

type RSVPFormProps = {
  initialData?: HouseholdRSVPData | null
  initialLastName?: string
  onLookup: (lastName: string, isFirstSearch: boolean) => Promise<HouseholdRSVPData | null>
  onSubmit: (data: HouseholdRSVPData) => Promise<void>
  onCancel: () => void
}

type RSVPFormErrors = {
  lastName?: string
  people?: string
}

export default function RSVPForm({ initialData, initialLastName = '', onLookup, onSubmit, onCancel }: RSVPFormProps) {
  const [lastNameInput, setLastNameInput] = useState(initialData?.lastName || initialLastName)
  const [household, setHousehold] = useState<HouseholdRSVPData | null>(initialData || null)
  const [errors, setErrors] = useState<RSVPFormErrors>({})
  const [loadingLookup, setLoadingLookup] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const validateForLookup = () => {
    const newErrors: RSVPFormErrors = {}
    if (!lastNameInput.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateForSubmit = () => {
    const newErrors: RSVPFormErrors = {}
    if (!household || household.people.length === 0) {
      newErrors.people = 'Please search for your household before submitting'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLookup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForLookup()) return

    setLoadingLookup(true)
    setErrors({})
    try {
      const data = await onLookup(lastNameInput.trim(), !hasSearched)
      setHasSearched(true)
      if (!data || data.people.length === 0) {
        setHousehold(null)
        setErrors({ people: 'No people found for that last name' })
        return
      }
      setHousehold(data)
    } catch (error) {
      console.error('RSVP lookup error:', error)
      setHousehold(null)
      setErrors({ people: 'Failed to look up household. Please try again.' })
    } finally {
      setLoadingLookup(false)
    }
  }

  const updatePerson = (index: number, next: Partial<PersonRSVP>) => {
    if (!household) {
      return
    }

    const people = household.people.map((person, currentIndex) => {
      if (currentIndex !== index) {
        return person
      }
      return { ...person, ...next }
    })

    setHousehold({ ...household, people })
  }

  const handleSubmit = async () => {
    if (!validateForSubmit() || !household) return

    setLoadingSubmit(true)
    try {
      await onSubmit(household)
    } catch (error) {
      console.error('RSVP submission error:', error)
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Find Your RSVP</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleLookup} className="space-y-4">
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={lastNameInput}
            onChange={(e) => setLastNameInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
        </div>
        <button
          type="submit"
          disabled={loadingLookup}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingLookup ? 'Searching...' : 'Search by Last Name'}
        </button>
      </form>

      {errors.people && <p className="text-red-600 text-sm">{errors.people}</p>}

      {household && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Household: <span className="font-semibold">{household.lastName}</span>
          </p>
          {household.people.map((person, index) => (
            <div key={person.name} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-800">{person.name}</h3>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700">Wedding Ceremony</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={person.ceremonyAttending}
                    onChange={(e) => updatePerson(index, { ceremonyAttending: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700">Wedding Reception</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={person.receptionAttending}
                    onChange={(e) => updatePerson(index, { receptionAttending: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div>
                <label htmlFor={`dietary-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <input
                  id={`dietary-${index}`}
                  type="text"
                  value={person.dietary}
                  onChange={(e) => updatePerson(index, { dietary: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., Vegetarian, Nut allergy"
                />
              </div>
            </div>
          ))}

          <div className="responsive-action-group">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loadingSubmit}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSubmit ? 'Submitting...' : 'Submit RSVP'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
