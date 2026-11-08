import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import api from '../lib/api.js'

function Bookings() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBookings() {
      try {
        const { data } = await api.get('/api/bookings')
        setBookings(data.bookings)
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Unable to load your bookings.')
      }
    }

    loadBookings()
  }, [])

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Your celebrations</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">Bookings</h1>
      {error && <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {bookings.length === 0 && !error ? (
        <section className="mt-10 rounded-3xl border border-dashed border-[#d9b8a5] bg-white p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f7e6d9] text-2xl">✨</div>
          <h2 className="mt-5 text-2xl font-bold">No bookings yet</h2>
          <p className="mx-auto mt-2 max-w-md text-[#766a60]">Choose a setup and submit a booking request to start planning your next celebration.</p>
          <Link to="/#packages" className="mt-6 inline-block rounded-full bg-[#d75443] px-6 py-3 font-bold text-white">Explore setups</Link>
        </section>
      ) : (
        <section className="mt-10 space-y-4">
          {bookings.map((booking) => (
            <article key={booking.id} className="flex flex-col gap-5 rounded-2xl border border-[#eee2d5] bg-white p-5 sm:flex-row">
              {booking.listingImages?.[0] ? <img src={booking.listingImages[0]} alt={booking.listingTitle} className="h-32 w-full rounded-xl object-cover sm:w-40" /> : <div className="grid h-32 w-full place-items-center rounded-xl bg-[#f7e6d9] text-3xl sm:w-40">✨</div>}
              <div className="flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="text-xl font-bold">{booking.listingTitle}</h2><span className="rounded-full bg-[#f7e6d9] px-3 py-1 text-xs font-semibold capitalize">{booking.status}</span></div><p className="mt-2 text-sm text-[#766a60]">Event: {new Date(`${booking.eventDate}T00:00:00`).toLocaleDateString('en-IN', { dateStyle: 'long' })}{booking.eventTime ? ` at ${booking.eventTime}` : ''}</p><p className="mt-1 text-sm text-[#766a60]">{booking.address}{booking.city ? `, ${booking.city}` : ''}</p><p className="mt-4 font-bold text-[#d75443]">₹{Number(booking.priceAtBooking).toLocaleString('en-IN')}</p></div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default Bookings
