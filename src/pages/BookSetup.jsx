import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import api from '../lib/api.js'

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

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/api/bookings', { ...form, listingId })
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
        </section>
        <section className="rounded-3xl border border-[#eee2d5] bg-white p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Make it yours</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold">Request this setup</h2>
          <p className="mt-2 text-sm text-[#766a60]">Share your celebration details and the lister will respond to your request.</p>
          {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold">Event date
              <input name="eventDate" type="date" min={new Date().toISOString().split('T')[0]} value={form.eventDate} onChange={handleChange} required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
            </label>
            <label className="block text-sm font-semibold">Preferred time <span className="font-normal text-[#9b8c80]">(optional)</span>
              <input name="eventTime" type="time" value={form.eventTime} onChange={handleChange} className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
            </label>
            <label className="block text-sm font-semibold">Address
              <input name="address" value={form.address} onChange={handleChange} required placeholder="Where should we set up?" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
            </label>
            <label className="block text-sm font-semibold">City
              <input name="city" value={form.city} onChange={handleChange} placeholder="New Delhi" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
            </label>
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
