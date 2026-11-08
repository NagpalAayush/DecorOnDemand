import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import api from '../lib/api.js'
import LocationMap from '../components/LocationMap.jsx'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getTodayKey() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function formatDate(dateValue) {
  if (!dateValue) return 'Choose a date'
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getCalendarDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const days = Array(firstDay.getDay()).fill(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day))
  }
  return days
}

function formatTime(timeValue) {
  if (!timeValue) return 'Choose a time'
  return new Date(`2000-01-01T${timeValue}`).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getPhotonCity(properties) {
  return properties.city || properties.town || properties.village || properties.municipality || properties.county || ''
}

function formatPhotonAddress(properties) {
  const streetAddress = [properties.housenumber, properties.street].filter(Boolean).join(' ')
  return [
    streetAddress || properties.name,
    getPhotonCity(properties),
    properties.state,
    properties.postcode,
    properties.country,
  ].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).join(', ')
}

function getPhotonSearchUrl(query, listing, limit) {
  const latitude = Number(listing?.latitude)
  const longitude = Number(listing?.longitude)
  const radiusKm = Number(listing?.serviceRadiusKm)
  const hasListingLocation = Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && Number.isFinite(radiusKm)
  const latitudeDelta = hasListingLocation ? radiusKm / 111 : 0
  const longitudeDelta = hasListingLocation
    ? radiusKm / (111 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.1))
    : 0
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    lang: 'en',
  })

  if (hasListingLocation) {
    params.set('lat', String(latitude))
    params.set('lon', String(longitude))
    params.set('bbox', [
      longitude - longitudeDelta,
      latitude - latitudeDelta,
      longitude + longitudeDelta,
      latitude + latitudeDelta,
    ].join(','))
  }

  return `https://photon.komoot.io/api/?${params.toString()}`
}

function BookSetup() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [form, setForm] = useState({
    eventDate: '',
    eventTime: '',
    address: '',
    city: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isTimeOpen, setIsTimeOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [bookingLocation, setBookingLocation] = useState({ latitude: '', longitude: '' })
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const todayKey = getTodayKey()

  useEffect(() => {
    async function loadListing() {
      try {
        const { data } = await api.get(`/api/listings/${listingId}`)
        setListing(data.listing)
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Unable to load this setup.')
      } finally {
        setIsLoading(false)
      }
    }

    loadListing()
  }, [listingId])

  useEffect(() => {
    const query = [form.address, form.city, listing?.city].filter(Boolean).join(', ').trim()
    if (query.length < 3 || bookingLocation.latitude) {
      setAddressSuggestions([])
      setIsLoadingSuggestions(false)
      return undefined
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      try {
        const response = await fetch(
          getPhotonSearchUrl(query, listing, 5),
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('Unable to load address suggestions.')
        const result = await response.json()
        setAddressSuggestions(result.features || [])
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setAddressSuggestions([])
      } finally {
        if (!controller.signal.aborted) setIsLoadingSuggestions(false)
      }
    }, 450)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [form.address, form.city, listing?.city, bookingLocation.latitude])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    if (name === 'address' || name === 'city') {
      setBookingLocation({ latitude: '', longitude: '' })
    }
  }

  const calendarDays = getCalendarDays(calendarMonth)
  const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2)
    const minutes = index % 2 === 0 ? '00' : '30'
    return `${String(hours).padStart(2, '0')}:${minutes}`
  })

  function selectDate(date) {
    const dateValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    setForm((currentForm) => ({ ...currentForm, eventDate: dateValue }))
    setIsDateOpen(false)
  }

  function selectAddressSuggestion(suggestion) {
    const properties = suggestion.properties || {}
    const [longitude, latitude] = suggestion.geometry.coordinates
    setForm((currentForm) => ({
      ...currentForm,
      address: formatPhotonAddress(properties),
      city: getPhotonCity(properties) || currentForm.city,
    }))
    setBookingLocation({ latitude, longitude })
    setAddressSuggestions([])
  }

  async function handleMapLocationChange({ latitude, longitude }) {
    setBookingLocation({ latitude, longitude })
    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
      )
      if (!response.ok) return
      const result = await response.json()
      const properties = result.features?.[0]?.properties
      if (!properties) return
      setForm((currentForm) => ({
        ...currentForm,
        address: formatPhotonAddress(properties) || currentForm.address,
        city: getPhotonCity(properties) || currentForm.city,
      }))
    } catch (requestError) {
      console.error('Unable to reverse geocode pinned booking location:', requestError)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!form.eventDate) {
      setError('Please choose an event date.')
      return
    }
    setIsSubmitting(true)

    try {
      let coordinates = bookingLocation
      if (!coordinates.latitude || !coordinates.longitude) {
        const locationQuery = [form.address, form.city, listing.city].filter(Boolean).join(', ')
        const locationResponse = await fetch(
          getPhotonSearchUrl(locationQuery, listing, 1),
        )
        if (!locationResponse.ok) throw new Error('Unable to verify the booking address.')
        const result = await locationResponse.json()
        const location = result.features?.[0]
        if (!location) {
          throw new Error('Choose an address suggestion or pinpoint the location on the map.')
        }
        coordinates = {
          latitude: Number(location.geometry.coordinates[1]),
          longitude: Number(location.geometry.coordinates[0]),
        }
      }

      await api.post('/api/bookings', {
        ...form,
        listingId,
        latitude: Number(coordinates.latitude),
        longitude: Number(coordinates.longitude),
      })
      navigate('/bookings')
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to submit your booking request.')
    } finally {
      setIsSubmitting(false)
    }

  }

  if (isLoading) {
    return <main className="grid min-h-[calc(100vh-125px)] place-items-center text-sm text-[#766a60]">Loading setup...</main>
  }

  if (!listing) {
    return <main className="mx-auto max-w-2xl px-5 py-16 text-center"><h1 className="font-serif text-4xl font-semibold">Setup unavailable</h1><p className="mt-3 text-[#766a60]">{error}</p><Link to="/" className="mt-6 inline-block rounded-full bg-[#d75443] px-6 py-3 font-bold text-white">Back home</Link></main>
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <Link to="/" className="text-sm font-bold text-[#d75443]">← Back home</Link>
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section>
          {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} className="h-72 w-full rounded-3xl object-cover" /> : <div className="grid h-72 place-items-center rounded-3xl bg-[#f7e6d9] text-5xl">✨</div>}
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">{listing.category}</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">{listing.title}</h1>
          <p className="mt-3 leading-7 text-[#766a60]">{listing.description || 'A thoughtfully styled setup for your celebration.'}</p>
          <p className="mt-5 text-lg font-bold text-[#d75443]">₹{Number(listing.price).toLocaleString('en-IN')}</p>
          <p className="mt-1 text-sm text-[#766a60]">{listing.location}{listing.city ? `, ${listing.city}` : ''}</p>
          <p className="mt-2 text-sm font-semibold text-[#766a60]">Service area: within {Number(listing.serviceRadiusKm)} km of this location</p>
        </section>
        <section className="rounded-3xl border border-[#eee2d5] bg-white p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Make it yours</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold">Request this setup</h2>
          <p className="mt-2 text-sm text-[#766a60]">Share your celebration details and the lister will respond to your request. Your event should be within the listed service area.</p>
          {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative text-sm font-semibold">
                <span>Event date</span>
                <button type="button" onClick={() => { setIsDateOpen((open) => !open); setIsTimeOpen(false) }} className="mt-2 flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-[#eaded2] bg-white px-4 text-left font-normal outline-none focus:border-[#d75443]">
                  {formatDate(form.eventDate)} <span className="text-[#d75443]">▾</span>
                </button>
                {isDateOpen && (
                  <div className="absolute left-0 right-0 top-[5.25rem] z-20 rounded-2xl border border-[#eaded2] bg-white p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="cursor-pointer rounded-lg px-2 py-1 text-lg hover:bg-[#fffaf5]">‹</button>
                      <strong>{calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
                      <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="cursor-pointer rounded-lg px-2 py-1 text-lg hover:bg-[#fffaf5]">›</button>
                    </div>
                    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-[#9b8c80]">
                      {dayNames.map((day) => <span key={day}>{day}</span>)}
                      {calendarDays.map((date, index) => date ? (
                        <button key={date.toISOString()} type="button" disabled={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` < todayKey} onClick={() => selectDate(date)} className={`h-8 cursor-pointer rounded-lg text-xs disabled:cursor-not-allowed disabled:text-[#d9cfc7] ${form.eventDate === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` ? 'bg-[#d75443] font-bold text-white' : 'hover:bg-[#fffaf5]'}`}>{date.getDate()}</button>
                      ) : <span key={`empty-${index}`} />)}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative text-sm font-semibold">
                <span>Preferred time <span className="font-normal text-[#9b8c80]">(optional)</span></span>
                <button type="button" onClick={() => { setIsTimeOpen((open) => !open); setIsDateOpen(false) }} className="mt-2 flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-[#eaded2] bg-white px-4 text-left font-normal outline-none focus:border-[#d75443]">
                  {formatTime(form.eventTime)} <span className="text-[#d75443]">▾</span>
                </button>
                {isTimeOpen && (
                  <div className="absolute left-0 right-0 top-[5.25rem] z-20 max-h-56 overflow-y-auto rounded-2xl border border-[#eaded2] bg-white p-2 shadow-xl">
                    <button type="button" onClick={() => { setForm((currentForm) => ({ ...currentForm, eventTime: '' })); setIsTimeOpen(false) }} className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs text-[#9b8c80] hover:bg-[#fffaf5]">No preferred time</button>
                    {timeOptions.map((time) => <button key={time} type="button" onClick={() => { setForm((currentForm) => ({ ...currentForm, eventTime: time })); setIsTimeOpen(false) }} className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs hover:bg-[#fffaf5] ${form.eventTime === time ? 'bg-[#f7e6d9] font-bold text-[#d75443]' : ''}`}>{formatTime(time)}</button>)}
                  </div>
                )}
              </div>
            </div>
            <label className="block text-sm font-semibold">Address
              <div className="relative">
                <input name="address" value={form.address} onChange={handleChange} required placeholder="Start typing an address" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
                {(isLoadingSuggestions || addressSuggestions.length > 0) && (
                  <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-xl border border-[#eaded2] bg-white shadow-xl">
                    {isLoadingSuggestions && <p className="px-4 py-3 text-xs text-[#9b8c80]">Finding addresses...</p>}
                    {addressSuggestions.map((suggestion) => (
                      <button key={suggestion.properties?.osm_id || suggestion.geometry.coordinates.join(',')} type="button" onClick={() => selectAddressSuggestion(suggestion)} className="block w-full cursor-pointer px-4 py-3 text-left text-xs text-[#2f2924] hover:bg-[#fffaf5]">
                        {formatPhotonAddress(suggestion.properties || {})}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>
            <label className="block text-sm font-semibold">City
              <input name="city" value={form.city} onChange={handleChange} placeholder="New Delhi" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
            </label>
            <div className="rounded-xl border border-[#eaded2] bg-[#fffaf5] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Confirm setup location</p>
                  <p className="mt-1 text-xs text-[#766a60]">Choose a suggestion or pinpoint the exact location on the map.</p>
                </div>
                <button type="button" onClick={() => setIsMapOpen((open) => !open)} className="cursor-pointer rounded-xl border border-[#d75443] px-3 py-2 text-sm font-bold text-[#d75443]">
                  {isMapOpen ? 'Hide map' : 'Pinpoint on map'}
                </button>
              </div>
              {isMapOpen && (
                <LocationMap
                  latitude={Number(bookingLocation.latitude || listing.latitude)}
                  longitude={Number(bookingLocation.longitude || listing.longitude)}
                  radiusKm={Number(listing.serviceRadiusKm)}
                  onLocationChange={handleMapLocationChange}
                />
              )}
              {bookingLocation.latitude && <p className="mt-2 text-xs font-semibold text-green-700">Location selected. Service radius will be checked before submitting.</p>}
            </div>
            <label className="block text-sm font-semibold">Notes <span className="font-normal text-[#9b8c80]">(optional)</span>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Tell the lister anything important..." className="mt-2 w-full rounded-xl border border-[#eaded2] px-4 py-3 outline-none focus:border-[#d75443]" />
            </label>
            <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer rounded-xl bg-[#d75443] py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Submitting request...' : 'Submit booking request'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default BookSetup
