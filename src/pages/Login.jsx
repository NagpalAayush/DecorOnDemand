import { useState } from 'react'
import api from '../lib/api.js'
import { Link, useLocation, useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { loginFailure, loginStart, loginSuccess } from '../slice/user-slice.js'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    dispatch(loginStart())

    try {
      const { data } = await api.post('/api/users/signin', form)

      dispatch(loginSuccess(data.user))
      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to sign in.')
      dispatch(loginFailure())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-125px)] place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#eee2d5] bg-white p-8 shadow-xl shadow-[#d5b9a2]/15 sm:p-10">
        <Link to="/" className="text-sm font-bold text-[#d75443]">← Back home</Link>
        <h1 className="mt-8 font-serif text-4xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-[#766a60]">Sign in to manage your celebrations.</p>
        {location.state?.message && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{location.state.message}</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold">Email address<input name="email" value={form.email} onChange={handleChange} type="email" placeholder="you@example.com" required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10" /></label>
          <label className="block text-sm font-semibold">Password<input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10" /></label>
          <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-[#d75443] py-3.5 font-bold text-white transition hover:bg-[#bd4435] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Signing in...' : 'Continue'}</button>
        </form>
        <Link to="/signup" className="mt-6 block text-center text-sm font-semibold text-[#d75443]">Create an account</Link>
        <p className="mt-6 text-center text-xs text-[#9b8c80]">New here? Your first celebration is waiting.</p>
      </div>
    </main>
  )
}

export default Login