import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import api from '../lib/api.js'

function AdminListings() {
  const isAdmin = useSelector((state) => state.user.user?.isAdmin)
  const [listings, setListings] = useState([])
  const [error, setError] = useState('')
  const [rejectionReasons, setRejectionReasons] = useState({})

  useEffect(() => {
    if (!isAdmin) return

    async function loadListings() {
      try {
        const { data } = await api.get('/api/listings/admin/approval')
        setListings(data.listings)
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Unable to load listings for approval.')
      }
    }

    loadListings()
  }, [isAdmin])

  if (!isAdmin) return <Navigate to="/account" replace />

  async function updateApproval(listingId, approvalStatus) {
    setError('')
    try {
      await api.patch(`/api/listings/admin/${listingId}/approval`, {
        approvalStatus,
        rejectionReason: rejectionReasons[listingId],
      })
      setListings((current) => current.filter((listing) => listing.id !== listingId))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to update listing approval.')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Admin studio</p><h1 className="mt-3 font-serif text-5xl font-semibold">Listing approvals</h1><p className="mt-3 text-[#766a60]">Review listings before they are visible to customers.</p></div>
        <Link to="/account" className="rounded-full border border-[#eaded2] px-5 py-2.5 text-sm font-bold">Back to account</Link>
      </div>
      {error && <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {listings.length === 0 && !error ? (
        <section className="mt-10 rounded-3xl border border-dashed border-[#d9b8a5] bg-white p-10 text-center">
          <h2 className="text-2xl font-bold">No listings awaiting approval</h2>
          <p className="mt-2 text-[#766a60]">New submissions will appear here.</p>
        </section>
      ) : (
        <section className="mt-10 space-y-5">
          {listings.map((listing) => <article key={listing.id} className="grid gap-5 rounded-2xl border border-[#eee2d5] bg-white p-5 md:grid-cols-[180px_1fr_auto]">
            {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} className="h-40 w-full rounded-xl object-cover md:h-36" /> : <div className="grid h-36 place-items-center rounded-xl bg-[#f7e6d9] text-3xl">✨</div>}
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b8c80]">{listing.category} · ₹{Number(listing.price).toLocaleString('en-IN')}</p><h2 className="mt-2 text-2xl font-bold">{listing.title}</h2><p className="mt-2 text-sm text-[#766a60]">{listing.description || 'No description provided.'}</p><p className="mt-3 text-sm font-semibold">Lister: {listing.listerName} · {listing.listerEmail}</p><p className="mt-1 text-sm text-[#766a60]">{listing.location}{listing.city ? `, ${listing.city}` : ''}</p></div>
            <div className="flex min-w-48 flex-col gap-2"><button type="button" onClick={() => updateApproval(listing.id, 'approved')} className="cursor-pointer rounded-xl bg-[#2f2924] px-4 py-2.5 text-sm font-bold text-white">Approve listing</button><input value={rejectionReasons[listing.id] || ''} onChange={(event) => setRejectionReasons({ ...rejectionReasons, [listing.id]: event.target.value })} placeholder="Reason if rejecting" className="rounded-xl border border-[#eaded2] px-3 py-2.5 text-sm outline-none focus:border-[#d75443]" /><button type="button" onClick={() => updateApproval(listing.id, 'rejected')} className="cursor-pointer rounded-xl border border-[#d75443] px-4 py-2.5 text-sm font-bold text-[#d75443]">Reject listing</button></div>
          </article>)}
        </section>
      )}
    </main>
  )
}

export default AdminListings
