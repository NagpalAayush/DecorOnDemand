import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import api from '../lib/api.js'

const initialForm = {
  title: '',
  description: '',
  category: '',
  price: '',
  location: '',
  city: '',
  images: '',
  listingStatus: 'draft',
}

function StyledSelect({ label, name, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((option) => option.value === value)

  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="relative mt-2 block">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#eaded2] bg-white px-4 text-left font-normal text-[#2f2924] outline-none transition hover:border-[#d9b8a5] focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10"
        >
          <span className={selectedOption?.value ? '' : 'text-[#9b8c80]'}>{selectedOption?.label}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 text-[#9b8c80] transition ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isOpen && (
          <span role="listbox" aria-label={label} className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-[#eaded2] bg-white p-1.5 shadow-xl shadow-[#d5b9a2]/20">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange({ target: { name, value: option.value } })
                  setIsOpen(false)
                }}
                className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-normal transition ${option.value === value ? 'bg-[#f7e6d9] font-semibold text-[#d75443]' : 'text-[#2f2924] hover:bg-[#fffaf5]'}`}
              >
                {option.label}
              </button>
            ))}
          </span>
        )}
      </span>
    </label>
  )
}

function CreateListing() {
  const navigate = useNavigate()
  const isLister = useSelector((state) => state.user.user?.isLister)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLister) {
    return <Navigate to="/account" replace />
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const images = form.images
        .split('\n')
        .map((image) => image.trim())
        .filter(Boolean)

      await api.post('/api/listings', {
        ...form,
        price: Number(form.price),
        images,
      })
      navigate('/my-listings')
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to create the listing.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <Link to="/my-listings" className="text-sm font-bold text-[#d75443]">← Back to my listings</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Lister studio</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">Create a listing</h1>
      <p className="mt-3 text-[#766a60]">Share your decor setup with customers.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-3xl border border-[#eee2d5] bg-white p-7 shadow-sm">
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-semibold">Listing title
          <input name="title" value={form.title} onChange={handleChange} required placeholder="The Rosé Romance" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
        </label>
        <label className="block text-sm font-semibold">Description
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Describe what customers will receive..." className="mt-2 w-full rounded-xl border border-[#eaded2] px-4 py-3 outline-none focus:border-[#d75443]" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <StyledSelect label="Category" name="category" value={form.category} onChange={handleChange} options={[
            { value: '', label: 'Select category' },
            { value: 'Birthday', label: 'Birthday' },
            { value: 'Wedding', label: 'Wedding' },
            { value: 'Proposal', label: 'Proposal' },
            { value: 'Baby shower', label: 'Baby shower' },
            { value: 'Other', label: 'Other' },
          ]} />
          <label className="block text-sm font-semibold">Price (₹)
            <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} required placeholder="4999" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
          </label>
        </div>
        <label className="block text-sm font-semibold">Location
          <input name="location" value={form.location} onChange={handleChange} required placeholder="12 Park Street" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
        </label>
        <label className="block text-sm font-semibold">City
          <input name="city" value={form.city} onChange={handleChange} placeholder="New Delhi" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
        </label>
        <label className="block text-sm font-semibold">Image URLs
          <textarea name="images" value={form.images} onChange={handleChange} rows="3" placeholder="Add one image URL per line" className="mt-2 w-full rounded-xl border border-[#eaded2] px-4 py-3 outline-none focus:border-[#d75443]" />
        </label>
        <div>
          <StyledSelect label="Publish status" name="listingStatus" value={form.listingStatus} onChange={handleChange} options={[
            { value: 'draft', label: 'Save as draft' },
            { value: 'published', label: 'Publish now' },
          ]} />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer rounded-xl bg-[#d75443] py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Creating listing...' : 'Create listing'}
        </button>
      </form>
    </main>
  )
}

export default CreateListing
