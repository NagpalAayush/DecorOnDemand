import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import  Signup  from './pages/Signup.jsx'
import Account from './pages/Account.jsx'
import Bookings from './pages/Bookings.jsx'
import BookingRequests from './pages/BookingRequests.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MyListings from './pages/MyListings.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import CreateListing from './pages/CreateListing.jsx'
import AdminListings from './pages/AdminListings.jsx'
import BookSetup from './pages/BookSetup.jsx'
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx'

function App() {
  const [currentLocation, setCurrentLocation] = useState(null)

  async function updateLocationFromCoordinates(latitude, longitude) {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    )
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status ${response.status}`)
    }

    const location = await response.json()
    const city = location.city || location.locality || location.principalSubdivision
    if (!city) {
      throw new Error('Unable to determine a city for this location.')
    }

    setCurrentLocation({ city, latitude, longitude })
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await updateLocationFromCoordinates(coords.latitude, coords.longitude)
        } catch (error) {
          console.error('Unable to determine city from browser location:', error)
        }
      },
      (error) => {
        console.error('Browser location permission failed:', error.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#2f2924]">
      <Header
        currentLocation={currentLocation}
        onLocationChange={updateLocationFromCoordinates}
      />
      <Routes>
        <Route path="/" element={<Home currentLocation={currentLocation} />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Home currentLocation={currentLocation} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/booking-requests" element={<ProtectedRoute><BookingRequests /></ProtectedRoute>} />
        <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path="/admin/listings" element={<AdminProtectedRoute><AdminListings /></AdminProtectedRoute>} />
        <Route path="/book/:listingId" element={<ProtectedRoute><BookSetup /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
