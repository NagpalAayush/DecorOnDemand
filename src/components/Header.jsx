import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import logo from "../resources/decorondemand_logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { logoutStart, logoutSuccess } from '../slice/user-slice.js'
import api from '../lib/api.js'

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="header-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="11" cy="11" r="6.5" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}



function Header({ currentLocation, onLocationChange }) {
  const dispatch = useDispatch()
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const user = useSelector((state) => state.user.user)
  const isLister = user?.isLister === true
  const isAdmin = user?.isAdmin === true
  const [query, setQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const profileRef = useRef(null)
  const locationRef = useRef(null)
  const locationSearchControllerRef = useRef(null)

  useEffect(() => {
    if (query) {
      const timeoutId = setTimeout(() => {
        console.log(`Searching for: ${query}`);
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [query])

  useEffect(() => {
    const trimmedQuery = locationQuery.trim()
    if (trimmedQuery.length < 2) {
      setLocationSuggestions([])
      setIsLoadingSuggestions(false)
      return undefined
    }

    const timeoutId = setTimeout(async () => {
      locationSearchControllerRef.current?.abort()
      const controller = new AbortController()
      locationSearchControllerRef.current = controller
      setIsLoadingSuggestions(true)

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        )
        if (!response.ok) {
          throw new Error('Unable to load location suggestions.')
        }

        const results = await response.json()
        if (!controller.signal.aborted) {
          setLocationSuggestions(results)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLocationError(error.message)
          setLocationSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false)
        }
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      locationSearchControllerRef.current?.abort()
    }
  }, [locationQuery])

  useEffect(() => {
    function closeOpenMenus(event) {
      if (!profileRef.current?.contains(event.target)) setIsProfileOpen(false)
      if (!locationRef.current?.contains(event.target)) setIsLocationOpen(false)
    }

    document.addEventListener('mousedown', closeOpenMenus)
    return () => document.removeEventListener('mousedown', closeOpenMenus)
  }, [])

  async function handleSignout() {
    dispatch(logoutStart())
    try {
      await api.post('/api/users/signout')
    } finally {
      dispatch(logoutSuccess())
      setIsProfileOpen(false)
    }
  }

  async function handleLocationSubmit(event) {
    event.preventDefault()
    if (!locationQuery.trim()) return

    setLocationError('')
    setIsUpdatingLocation(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(locationQuery.trim())}`,
      )
      if (!response.ok) {
        throw new Error('Unable to search for that location.')
      }

      async function handleLocationSuggestionSelect(suggestion) {
        setLocationError('')
        setIsUpdatingLocation(true)
        try {
          await onLocationChange(Number(suggestion.lat), Number(suggestion.lon))
          setLocationQuery('')
          setLocationSuggestions([])
          setIsLocationOpen(false)
        } catch (error) {
          setLocationError(error.message)
        } finally {
          setIsUpdatingLocation(false)
        }
      }

      const results = await response.json()
      if (!results[0]) {
        throw new Error('Location not found. Try a city or locality name.')
      }

      await onLocationChange(Number(results[0].lat), Number(results[0].lon))
      setLocationQuery('')
      setIsLocationOpen(false)
    } catch (error) {
      setLocationError(error.message)
    } finally {
      setIsUpdatingLocation(false)
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

        <div ref={locationRef} className="relative hidden items-center gap-2 text-left text-sm text-[#766a60] lg:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f7e6d9] text-[#d75443]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <button type="button" onClick={() => setIsLocationOpen((open) => !open)} className="cursor-pointer text-left">
            <b className="block font-semibold text-[#2f2924]">Book near</b>{currentLocation?.city || 'Detecting your city...'}
          </button>
          {isLocationOpen && (
            <form onSubmit={handleLocationSubmit} className="absolute left-0 top-12 z-40 w-72 rounded-2xl border border-[#eee2d5] bg-white p-3 shadow-xl">
              <label className="text-xs font-semibold text-[#766a60]">Change booking location
                <input
                  autoFocus
                  value={locationQuery}
                  onChange={(event) => setLocationQuery(event.target.value)}
                  placeholder="Enter city or locality"
                  className="mt-2 h-10 w-full rounded-xl border border-[#eaded2] px-3 text-sm font-normal text-[#2f2924] outline-none focus:border-[#d75443]"
                />
              </label>
              {(isLoadingSuggestions || locationSuggestions.length > 0) && (
                <div className="mt-2 overflow-hidden rounded-xl border border-[#eee2d5]">
                  {isLoadingSuggestions && <p className="px-3 py-2 text-xs text-[#9b8c80]">Searching locations...</p>}
                  {locationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => handleLocationSuggestionSelect(suggestion)}
                      className="block w-full px-3 py-2 text-left text-xs text-[#2f2924] transition hover:bg-[#fffaf5]"
                    >
                      {suggestion.display_name}
                    </button>
                  ))}
                </div>
              )}
              {locationError && <p className="mt-2 text-xs text-red-700">{locationError}</p>}
              <button type="submit" disabled={isUpdatingLocation} className="mt-3 w-full cursor-pointer rounded-xl bg-[#d75443] px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
                {isUpdatingLocation ? 'Updating...' : 'Use this location'}
              </button>
              <button type="button" onClick={() => navigator.geolocation?.getCurrentPosition(({ coords }) => onLocationChange(coords.latitude, coords.longitude))} className="mt-2 w-full cursor-pointer rounded-xl border border-[#eaded2] px-3 py-2 text-sm font-semibold">
                Use my current location
              </button>
            </form>
          )}
        </div>

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
                <div ref={profileRef} className="relative">
                  <button type="button" aria-expanded={isProfileOpen} onClick={() => setIsProfileOpen((open) => !open)} className="cursor-pointer rounded-full bg-[#d75443] px-4 py-2.5 text-sm font-bold text-white">
                    {user?.name || 'Profile'} <span className="ml-1 text-xs">▾</span>
                  </button>
                  {isProfileOpen && <div className="absolute right-0 top-12 z-40 w-52 rounded-2xl border border-[#eee2d5] bg-white p-2 shadow-xl">
                    <p className="border-b border-[#f1e7de] px-3 py-2 text-xs text-[#9b8c80]">{user?.email}</p>
                    <Link to="/account" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#fffaf5]">My Account</Link>
                    <Link to="/bookings" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#fffaf5]">Bookings</Link>
                    {isLister && <>
                      <Link to="/my-listings" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#fffaf5]">Show My Listings</Link>
                      <Link to="/create-listing" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#fffaf5]">Create Listing</Link>
                    </>}
                    {isAdmin && <Link to="/admin/listings" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[#fffaf5]">Approve Listings</Link>}
                    <button type="button" onClick={handleSignout} className="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#d75443] hover:bg-[#fffaf5]">Sign out</button>
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
