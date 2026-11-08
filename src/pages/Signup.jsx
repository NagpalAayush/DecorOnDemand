import { useState } from 'react'
import api from '../lib/api.js'
import { Link, useNavigate } from 'react-router'

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', isLister: false })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm({ ...form, [event.target.name]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/api/users/signup', form)

      navigate('/login', {
        state: { message: 'Account created successfully. Please sign in.' },
      })
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-125px)] place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#eee2d5] bg-white p-8 shadow-xl shadow-[#d5b9a2]/15 sm:p-10">
        <Link to="/" className="text-sm font-bold text-[#d75443]">← Back home</Link>
        <h1 className="mt-8 font-serif text-4xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-[#766a60]">Start planning your perfect celebration.</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold">Name<input name="name" value={form.name} onChange={handleChange} type="text" placeholder="Your name" required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10" /></label>
          <label className="block text-sm font-semibold">Email address<input name="email" value={form.email} onChange={handleChange} type="email" placeholder="you@example.com" required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10" /></label>
          <label className="block text-sm font-semibold">Password<input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" minLength="8" required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10" /></label>
          <label className="flex items-start gap-3 text-sm text-[#766a60]"><input name="isLister" checked={form.isLister} onChange={handleChange} type="checkbox" className="mt-1 accent-[#d75443]" /><span><b className="text-[#2f2924]">I want to list decor</b><br />Show my own decor listings to customers.</span></label>
          <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-[#d75443] py-3.5 font-bold text-white transition hover:bg-[#bd4435] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#766a60]">Already have an account? <Link to="/login" className="font-semibold text-[#d75443]">Sign in</Link></p>
      </div>
    </main>
  )
}

export default Signup;