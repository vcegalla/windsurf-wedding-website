import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { RSVPData } from '../types'

type RSVPFormProps = {
  initialData?: RSVPData
  onSubmit: (data: RSVPData) => Promise<void>
  onCancel: () => void
}

type RSVPFormErrors = {
  name?: string
  guests?: string
}

export default function RSVPForm({ initialData, onSubmit, onCancel }: RSVPFormProps) {
  const [formData, setFormData] = useState<RSVPData>({
    name: initialData?.name || '',
    attending: initialData?.attending ?? true,
    guests: initialData?.guests || 1,
    dietary: initialData?.dietary || '',
    message: initialData?.message || '',
  })
  const [errors, setErrors] = useState<RSVPFormErrors>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: RSVPFormErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (formData.attending && (formData.guests < 1 || formData.guests > 10)) {
      newErrors.guests = 'Number of guests must be between 1 and 10'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('RSVP submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">RSVP Form</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Will you attend? *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === true}
                onChange={() => setFormData({ ...formData, attending: true })}
                className="w-4 h-4 text-primary-600"
              />
              <span>Yes, I'll be there</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === false}
                onChange={() => setFormData({ ...formData, attending: false })}
                className="w-4 h-4 text-primary-600"
              />
              <span>Sorry, can't make it</span>
            </label>
          </div>
        </div>

        {formData.attending && (
          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests (including yourself)
            </label>
            <input
              type="number"
              id="guests"
              min="1"
              max="10"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value, 10) || 1 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
            {errors.guests && <p className="text-red-600 text-sm mt-1">{errors.guests}</p>}
          </div>
        )}

        <div>
          <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Requirements
          </label>
          <input
            type="text"
            id="dietary"
            value={formData.dietary}
            onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            placeholder="e.g., Vegetarian, Gluten-free, etc."
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message for the Couple (Optional)
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
            placeholder="Share your wishes or questions..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit RSVP'}
          </button>
        </div>
      </form>
    </div>
  )
}
