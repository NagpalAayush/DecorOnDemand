import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import api from '../lib/api.js'

function MyListings() {
  const isLister = useSelector((state) => state.user.user?.isLister)
  const [listings, setListings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLister) return

    async function loadListings() {
      try {
        const { data } = await api.get('/api/listings')
        setListings(data.listings)
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Unable to load your listings.')
      }
    }

    loadListings()
  }, [isLister])

  if (!isLister) {
    return <Navigate to="/account" replace />
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Lister studio</p><h1 className="mt-3 font-serif text-5xl font-semibold">My listings</h1><p className="mt-3 text-[#766a60]">Manage the decor setups you share with customers.</p></div>
        <Link to="/account" className="rounded-full border border-[#eaded2] px-5 py-2.5 text-sm font-bold">Back to account</Link>
      </div>
      {error && <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {listings.length === 0 && !error ? (
        <section className="mt-10 rounded-3xl border border-dashed border-[#d9b8a5] bg-white p-10 text-center">
          <h2 className="text-2xl font-bold">No listings yet</h2>
          <p className="mt-2 text-[#766a60]">Your future decor listings will appear here.</p>
        </section>
      ) : (
        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => <article key={listing.id} className="overflow-hidden rounded-2xl border border-[#eee2d5] bg-white">
            {listing.images?.[0] && <img src={listing.images[0]} alt={listing.title} className="h-48 w-full object-cover" />}
            <div className="p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b8c80]">{listing.category}</p><h2 className="mt-2 text-xl font-bold">{listing.title}</h2><p className="mt-2 text-sm text-[#766a60]">{listing.location}{listing.city ? `, ${listing.city}` : ''}</p><p className="mt-1 text-xs text-[#766a60]">Service radius: {Number(listing.serviceRadiusKm)} km</p><p className="mt-4 font-bold text-[#d75443]">₹{Number(listing.price).toLocaleString('en-IN')}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-[#f7e6d9] px-3 py-1 text-xs font-semibold">{listing.listingStatus}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${listing.approvalStatus === 'approved' ? 'bg-green-50 text-green-700' : listing.approvalStatus === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{listing.approvalStatus}</span></div>{listing.rejectionReason && <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">Reason: {listing.rejectionReason}</p>}</div>
          </article>)}
        </section>
      )}
    </main>
  )
}

export default MyListings
