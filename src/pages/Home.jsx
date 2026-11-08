import { useEffect, useState } from 'react'
import { categories, packages, steps } from '../data/homeData.js'
import PackageCard from '../components/PackageCard.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import api from '../lib/api.js'

function Home() {
  const [occasion, setOccasion] = useState('Birthday')
  const [listings, setListings] = useState([])

  useEffect(() => {
    let isMounted = true

    async function loadListings() {
      try {
        const { data } = await api.get('/api/listings/published')
        if (isMounted) {
          setListings(data.listings || [])
        }
      } catch (error) {
        console.error('Unable to load published listings:', error)
      }
    }

    loadListings()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main>
      <section className="relative overflow-hidden bg-[#f4dfd0]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <div className="relative z-10">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-[#d75443]">Celebrate beautifully</p>
            <h1 className="max-w-xl font-serif text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-[#2f2924] sm:text-7xl">
              Your moment.<br /><em className="font-normal text-[#d75443]">Our magic.</em>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#766a60]">Thoughtfully styled celebrations delivered to your doorstep. From the first idea to the final photo.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#collections" className="rounded-full bg-[#d75443] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#d75443]/20 transition hover:-translate-y-0.5 hover:bg-[#bd4435]">Explore celebrations</a>
              <a href="#how-it-works" className="rounded-full border border-[#d9b8a5] px-6 py-3.5 text-sm font-bold text-[#2f2924] transition hover:bg-white/60">How it works</a>
            </div>
          </div>
          <div className="relative min-h-[330px] sm:min-h-[450px]">
            <div className="absolute inset-4 rotate-2 overflow-hidden rounded-[2rem] shadow-2xl shadow-[#9c654f]/20 sm:inset-8">
              <img src="https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1200&q=90" alt="Beautifully decorated celebration table" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 rounded-2xl bg-white px-4 py-3 shadow-xl sm:left-4">
              <p className="text-xs text-[#9b8c80]">Launching soon</p><p className="font-bold">Made for your special moments ✨</p>
            </div>
          </div>
        </div>
      </section>

      <section id="collections" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <SectionHeading eyebrow="Find your feeling" title="What are we celebrating?" action="View all" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <a href="#packages" key={category.title} className="group relative aspect-[0.9] overflow-hidden rounded-2xl bg-[#f5e8dc]">
              <img src={category.image} alt={category.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 text-white"><h3 className="text-xl font-bold">{category.title}</h3><p className="mt-1 text-sm text-white/80">{category.subtitle}</p></div>
            </a>
          ))}
        </div>
      </section>

      <section id="packages" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <SectionHeading eyebrow="Made for your moment" title="Most-loved setups" action="See all setups" />
          <div className="flex flex-col gap-5 sm:flex-row">
            {listings.length > 0 ? listings.slice(0, 3).map((listing) => (
              <PackageCard
                key={listing.id}
                item={{
                  ...listing,
                  name: listing.title,
                  type: listing.category,
                  price: `₹${Number(listing.price).toLocaleString('en-IN')}`,
                  image: listing.images?.[0] || packages[0].image,
                  tag: listing.approvalStatus === 'approved' ? 'Approved' : '',
                }}
              />
            )) : (
              <p className="rounded-2xl border border-[#eee2d5] bg-[#fffaf5] px-5 py-8 text-sm text-[#766a60]">
                New celebration setups are coming soon.
              </p>
            )}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Simple by design</p><h2 className="max-w-sm font-serif text-4xl font-semibold leading-tight tracking-[-0.05em]">Big moments, made easy.</h2><p className="mt-5 max-w-sm leading-7 text-[#766a60]">No endless scrolling. No last-minute panic. Just beautiful decor and a team that cares.</p></div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map(([number, title, description]) => <div key={number} className="border-t-2 border-[#eac4b2] pt-5"><span className="text-sm font-bold text-[#d75443]">{number}</span><h3 className="mt-8 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#766a60]">{description}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#2f2924] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 sm:flex-row sm:items-center lg:px-8">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#efad93]">Let’s make it yours</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">Have something special in mind?</h2></div>
          <div className="flex flex-wrap gap-2">
            {['Birthday', 'Wedding', 'Other'].map((item) => <button key={item} onClick={() => setOccasion(item)} className={`rounded-full border px-5 py-2.5 text-sm transition ${occasion === item ? 'border-[#efad93] bg-[#efad93] text-[#2f2924]' : 'border-white/30 text-white hover:border-white'}`}>{item}</button>)}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
