import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import api from '../lib/api.js'
import { formatBookingDate } from '../lib/date.js'

function BookingRequests() {
  const isLister = useSelector((state) => state.user.user?.isLister)
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [updatingRequestId, setUpdatingRequestId] = useState('')
  const [openRequestId, setOpenRequestId] = useState('')

  useEffect(() => {
    if (!isLister) return

    async function loadRequests() {
      try {
        const { data } = await api.get('/api/bookings/requests')
        setRequests(data.bookings)
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Unable to load booking requests.')
      }
    }

    loadRequests()
  }, [isLister])

  async function handleStatusChange(bookingId, status) {
    setError('')
    setUpdatingRequestId(bookingId)

    try {
      await api.patch(`/api/bookings/${bookingId}/status`, { status })
      setRequests((currentRequests) => currentRequests.map((request) => (
        request.id === bookingId ? { ...request, status } : request
      )))
      setOpenRequestId('')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to update booking status.')
    } finally {
      setUpdatingRequestId('')
    }
  }

  if (!isLister) {
    return <Navigate to="/account" replace />
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Lister studio</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold">Booking Requests</h1>
          <p className="mt-3 text-[#766a60]">Review celebration requests for your decor setups.</p>
        </div>
        <Link to="/account" className="rounded-full border border-[#eaded2] px-5 py-2.5 text-sm font-bold">Back to account</Link>
      </div>
      {error && <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {requests.length === 0 && !error ? (
        <section className="mt-10 rounded-3xl border border-dashed border-[#d9b8a5] bg-white p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f7e6d9] text-2xl">📋</div>
          <h2 className="mt-5 text-2xl font-bold">No booking requests yet</h2>
          <p className="mx-auto mt-2 max-w-md text-[#766a60]">New requests for your published setups will appear here.</p>
        </section>
      ) : (
        <section className="mt-10 space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="flex flex-col gap-5 rounded-2xl border border-[#eee2d5] bg-white p-5 sm:flex-row">
              {request.listingImages?.[0]
                ? <img src={request.listingImages[0]} alt={request.listingTitle} className="h-32 w-full rounded-xl object-cover sm:w-40" />
                : <div className="grid h-32 w-full place-items-center rounded-xl bg-[#f7e6d9] text-3xl sm:w-40">✨</div>}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b8c80]">Setup request</p>
                    <h2 className="mt-1 text-xl font-bold">{request.listingTitle}</h2>
                  </div>
                  {request.status === 'pending' ? (
                    <div className="relative">
                      <button
                        type="button"
                        aria-expanded={openRequestId === request.id}
                        aria-haspopup="menu"
                        disabled={updatingRequestId === request.id}
                        onClick={() => setOpenRequestId((currentId) => currentId === request.id ? '' : request.id)}
                        className="flex h-7 min-w-28 cursor-pointer items-center justify-between gap-2 rounded-full border border-[#eaded2] bg-[#f7e6d9] px-3 text-xs font-semibold capitalize leading-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Pending <span aria-hidden="true" className="text-[10px]">▾</span>
                      </button>
                      {openRequestId === request.id && (
                        <div role="menu" className="absolute right-0 top-9 z-10 w-28 overflow-hidden rounded-xl border border-[#eaded2] bg-white p-1 shadow-lg">
                          <button type="button" role="menuitem" onClick={() => handleStatusChange(request.id, 'confirmed')} className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#2f2924] hover:bg-[#fffaf5]">Approve</button>
                          <button type="button" role="menuitem" onClick={() => handleStatusChange(request.id, 'rejected')} className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#2f2924] hover:bg-[#fffaf5]">Reject</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="rounded-full bg-[#f7e6d9] px-3 py-1 text-xs font-semibold capitalize">{request.status}</span>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold">{request.customerName} <span className="font-normal text-[#766a60]">({request.customerEmail})</span></p>
                <p className="mt-1 text-sm text-[#766a60]">Event: {formatBookingDate(request.eventDate)}{request.eventTime ? ` at ${String(request.eventTime).slice(0, 5)}` : ''}</p>
                <p className="mt-1 text-sm text-[#766a60]">{request.address}{request.city ? `, ${request.city}` : ''}</p>
                {request.notes && <p className="mt-3 rounded-xl bg-[#fffaf5] p-3 text-sm text-[#766a60]">Notes: {request.notes}</p>}
                <p className="mt-4 font-bold text-[#d75443]">₹{Number(request.priceAtBooking).toLocaleString('en-IN')}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default BookingRequests
