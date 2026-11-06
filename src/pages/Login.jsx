import { Link } from 'react-router'

function Login() {
  return (
    <main className="grid min-h-[calc(100vh-125px)] place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#eee2d5] bg-white p-8 shadow-xl shadow-[#d5b9a2]/15 sm:p-10">
        <Link to="/" className="text-sm font-bold text-[#d75443]">← Back home</Link>
        <h1 className="mt-8 font-serif text-4xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-[#766a60]">Sign in to manage your celebrations.</p>
        <form className="mt-8 space-y-4">
          <label className="block text-sm font-semibold">Email address<input type="email" placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10" /></label>
          <label className="block text-sm font-semibold">Password<input type="password" placeholder="••••••••" className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10" /></label>
          <button type="submit" className="w-full rounded-xl bg-[#d75443] py-3.5 font-bold text-white transition hover:bg-[#bd4435]">Continue</button>
        </form>
        <p className="mt-6 text-center text-xs text-[#9b8c80]">New here? Your first celebration is waiting.</p>
      </div>
    </main>
  )
}

export default Login
