import { Link } from 'react-router'

function Bookings() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Your celebrations</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">Bookings</h1>
      <section className="mt-10 rounded-3xl border border-dashed border-[#d9b8a5] bg-white p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f7e6d9] text-2xl">✨</div>
        <h2 className="mt-5 text-2xl font-bold">No bookings yet</h2>
        <p className="mx-auto mt-2 max-w-md text-[#766a60]">Choose a setup and add it to your cart to start planning your next celebration.</p>
        <Link to="/#packages" className="mt-6 inline-block rounded-full bg-[#d75443] px-6 py-3 font-bold text-white">Explore setups</Link>
      </section>
    </main>
  )
}

export default Bookings
