import { useEffect, useState } from 'react'
import { Link } from 'react-router'

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="header-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="11" cy="11" r="6.5" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function Header() {
  const [query, setQuery] = useState('')
  useEffect(() => {
    if (query) {
      const timeoutId = setTimeout(() => {
        console.log(`Searching for: ${query}`);
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [query])

  return (
    <header className="sticky top-0 z-30 border-b border-[#eee2d5] bg-[#fffaf5]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4 lg:px-8">
        <Link to="/" className="shrink-0 text-xl font-black tracking-[-0.06em] text-[#d75443] sm:text-2xl">
          decor<span className="text-[#2f2924]">on</span>demand
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
          <button aria-label="Shopping bag" className="grid h-10 w-10 place-items-center rounded-full text-xl transition hover:bg-[#f7e6d9]">♧</button>
          <Link to="/login" className="rounded-full bg-[#d75443] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#bd4435] sm:px-5">
            Log in
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
