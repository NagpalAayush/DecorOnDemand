import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import logo from "../resources/decorondemand_logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { logoutStart, logoutSuccess } from '../slice/user-slice.js'
import { clearCart } from '../slice/cart-slice.js'
import api from '../lib/api.js'

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="header-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="11" cy="11" r="6.5" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}



function Header() {
  const dispatch = useDispatch()
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const user = useSelector((state) => state.user.user)
  const cartItems = useSelector((state) => state.cart.items)
  const [query, setQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)
  useEffect(() => {
    if (query) {
      const timeoutId = setTimeout(() => {
        console.log(`Searching for: ${query}`);
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [query])

  useEffect(() => {
    function closeProfile(event) {
      if (!profileRef.current?.contains(event.target)) setIsProfileOpen(false)
    }

    document.addEventListener('mousedown', closeProfile)
    return () => document.removeEventListener('mousedown', closeProfile)
  }, [])

  async function handleSignout() {
    dispatch(logoutStart())
    try {
      await api.post('/api/users/signout')
    } finally {
      dispatch(logoutSuccess())
      dispatch(clearCart())
      setIsProfileOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#eee2d5] bg-[#fffaf5]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4 lg:px-8">
        <Link to="/" className="shrink-0 text-xl font-black tracking-[-0.06em] text-[#d75443] sm:text-2xl">
          {/* Left - Logo + Location */}
          <img
            src={logo}
            alt="DecorOnDemand - Fulfilling Your Decor Demands"
            className="h-20 p-0 w-auto object-contain"
          />
        </Link>

        <button className="hidden items-center gap-2 text-left text-sm text-[#766a60] lg:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f7e6d9] text-[#d75443]">⌖</span>
          <span><b className="block font-semibold text-[#2f2924]">Deliver to</b>New Delhi, India</span>
        </button>

        <div className="header-search ml-auto hidden max-w-xl flex-1 md:block">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search birthday, wedding, proposal and more..."
            aria-label="Search decorations"
            className="h-11 w-full rounded-full border border-[#eaded2] bg-white pl-12 pr-5 text-sm outline-none transition focus:border-[#d75443] focus:ring-4 focus:ring-[#d75443]/10"
          />
          {query && <span className="absolute right-4 top-3 text-xs text-[#9b8c80]">Searching...</span>}
        </div>

        <nav className="flex items-center gap-2">
            {!isLoggedIn ? (
              <Link to="/login" className="rounded-full bg-[#d75443] px-4 py-2.5 text-sm font-bold text-white">
                Log in
              </Link>
            ) : (
              <>
                <Link to="/cart" className="relative rounded-full border border-[#eaded2] bg-white px-4 py-2.5 text-sm font-bold text-[#2f2924]">
                  Cart
                  {cartItems.length > 0 && <span className="ml-2 inline-grid min-h-5 min-w-5 place-items-center rounded-full bg-[#d75443] px-1 text-[11px] text-white">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>}
                </Link>
                <div ref={profileRef} className="relative">
                  <button type="button" aria-expanded={isProfileOpen} onClick={() => setIsProfileOpen((open) => !open)} className="rounded-full bg-[#d75443] px-4 py-2.5 text-sm font-bold text-white">
                    {user?.name || 'Profile'} <span className="ml-1 text-xs">▾</span>
                  </button>
                  {isProfileOpen && <div className="absolute right-0 top-12 z-40 w-52 rounded-2xl border border-[#eee2d5] bg-white p-2 shadow-xl">
                    <p className="border-b border-[#f1e7de] px-3 py-2 text-xs text-[#9b8c80]">{user?.email}</p>
                    <Link to="/account" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#fffaf5]">My Account</Link>
                    <Link to="/bookings" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#fffaf5]">Bookings</Link>
                    <button type="button" onClick={handleSignout} className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#d75443] hover:bg-[#fffaf5]">Sign out</button>
                  </div>}
                </div>
              </>
            )}
        </nav>
      </div>
    </header>
  )
}

export default Header
