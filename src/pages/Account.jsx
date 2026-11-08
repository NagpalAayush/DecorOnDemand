import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import api from '../lib/api.js'
import { deregisterAsListerSuccess, registerAsListerSuccess } from '../slice/user-slice.js'

function Account() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isConfirmingLister, setIsConfirmingLister] = useState(false)
  const [isConfirmingDeregister, setIsConfirmingDeregister] = useState(false)
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined

    const timeoutId = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(timeoutId)
  }, [toast])

  async function handleRegisterAsLister(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/api/users/register-lister', { password })
      dispatch(registerAsListerSuccess())
      setPassword('')
      setIsConfirmingLister(false)
      setToast('You are now registered as a lister.')
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to register as a lister.')
    } finally {
      setIsSubmitting(false)
    }

  }

  async function handleDeregisterAsLister(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/api/users/deregister-lister', { password })
      dispatch(deregisterAsListerSuccess())
      setPassword('')
      setIsConfirmingDeregister(false)
      setToast('You have been deregistered as a lister.')
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to deregister as a lister.')
    } finally {
      setIsSubmitting(false)
    }

  }

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
          {!user?.isLister && (
            <div className="mt-4 rounded-xl border border-[#f1d1c1] bg-[#fff8f3] p-4">
              <h3 className="font-bold">Want to list your decor?</h3>
              <p className="mt-1 text-sm text-[#766a60]">Register as a lister to publish your own celebration setups.</p>
              {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
              {!isConfirmingLister ? (
                <button type="button" onClick={() => setIsConfirmingLister(true)} className="mt-4 cursor-pointer rounded-full bg-[#d75443] px-4 py-2.5 text-sm font-bold text-white">
                  Register as a lister
                </button>
              ) : (
                <form onSubmit={handleRegisterAsLister} className="mt-4 rounded-xl bg-white p-4">
                  <label className="block text-sm font-semibold">Confirm your password
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus className="mt-2 h-11 w-full rounded-xl border border-[#eaded2] px-3 outline-none focus:border-[#d75443]" />
                  </label>
                  <div className="mt-3 flex gap-2">
                    <button type="submit" disabled={isSubmitting} className="cursor-pointer rounded-full bg-[#d75443] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Registering...' : 'Confirm'}</button>
                    <button type="button" onClick={() => { setIsConfirmingLister(false); setPassword(''); setError('') }} className="cursor-pointer rounded-full border border-[#eaded2] px-4 py-2 text-sm font-semibold">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
          {user?.isLister && (
            <div className="mt-4 rounded-xl border border-[#eaded2] bg-white p-4">
              <h3 className="font-bold">No longer listing decor?</h3>
              <p className="mt-1 text-sm text-[#766a60]">You can deregister as a lister after removing all your listings.</p>
              {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
              {!isConfirmingDeregister ? (
                <button type="button" onClick={() => setIsConfirmingDeregister(true)} className="mt-4 cursor-pointer rounded-full border border-[#d75443] px-4 py-2.5 text-sm font-bold text-[#d75443]">Deregister as a lister</button>
              ) : (
                <form onSubmit={handleDeregisterAsLister} className="mt-4 rounded-xl bg-[#fffaf5] p-4">
                  <label className="block text-sm font-semibold">Confirm your password
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus className="mt-2 h-11 w-full rounded-xl border border-[#eaded2] px-3 outline-none focus:border-[#d75443]" />
                  </label>
                  <div className="mt-3 flex gap-2">
                    <button type="submit" disabled={isSubmitting} className="cursor-pointer rounded-full bg-[#d75443] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Deregistering...' : 'Confirm'}</button>
                    <button type="button" onClick={() => { setIsConfirmingDeregister(false); setPassword(''); setError('') }} className="cursor-pointer rounded-full border border-[#eaded2] px-4 py-2 text-sm font-semibold">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>
        <div className="space-y-4">
          <Link to="/bookings" className="block rounded-2xl border border-[#eee2d5] bg-white p-5 font-bold transition hover:border-[#d75443]">View my bookings <span className="float-right text-[#d75443]">→</span></Link>
          <Link to="/cart" className="block rounded-2xl border border-[#eee2d5] bg-white p-5 font-bold transition hover:border-[#d75443]">View my cart <span className="float-right text-[#d75443]">→</span></Link>
          <Link to="/change-password" className="block rounded-2xl bg-[#d75443] p-5 font-bold text-white transition hover:bg-[#bd4435]">Change password <span className="float-right">→</span></Link>
        </div>
      </div>
      {toast && <div role="status" className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#2f2924] px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </main>
  )
}

export default Account
