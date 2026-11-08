import { useState } from 'react'
import { Link } from 'react-router'
import api from '../lib/api.js'

function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await api.post('/api/users/change-password', form)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Your password has been changed successfully.')
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to change your password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 lg:px-8">
      <Link to="/account" className="text-sm font-bold text-[#d75443]">← Back to account</Link>
      <h1 className="mt-8 font-serif text-5xl font-semibold">Change password</h1>
      <p className="mt-3 text-[#766a60]">Choose a strong password to keep your account secure.</p>
      <section className="mt-8 rounded-3xl border border-[#eee2d5] bg-white p-7 shadow-sm">
        {error && <p className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold">Current password
            <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
          </label>
          <label className="block text-sm font-semibold">New password
            <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} minLength="8" required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
          </label>
          <label className="block text-sm font-semibold">Confirm new password
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} minLength="8" required className="mt-2 h-12 w-full rounded-xl border border-[#eaded2] px-4 outline-none focus:border-[#d75443]" />
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer rounded-xl bg-[#d75443] py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Changing password...' : 'Change password'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default ChangePassword
