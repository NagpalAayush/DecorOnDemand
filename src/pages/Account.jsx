import { Link } from 'react-router'
import { useSelector } from 'react-redux'

function Account() {
  const user = useSelector((state) => state.user.user)

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d75443]">Your profile</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">My account</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_0.7fr]">
        <section className="rounded-3xl border border-[#eee2d5] bg-white p-7 shadow-sm">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f7e6d9] text-2xl font-bold text-[#d75443]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-5 text-2xl font-bold">{user?.name}</h2>
          <p className="mt-2 text-[#766a60]">{user?.email}</p>
          <p className="mt-6 rounded-xl bg-[#fffaf5] p-4 text-sm text-[#766a60]">Your account is ready for beautiful celebrations.</p>
        </section>
        <div className="space-y-4">
          <Link to="/bookings" className="block rounded-2xl border border-[#eee2d5] bg-white p-5 font-bold transition hover:border-[#d75443]">View my bookings <span className="float-right text-[#d75443]">→</span></Link>
          <Link to="/cart" className="block rounded-2xl border border-[#eee2d5] bg-white p-5 font-bold transition hover:border-[#d75443]">View my cart <span className="float-right text-[#d75443]">→</span></Link>
        </div>
      </div>
    </main>
  )
}

export default Account
