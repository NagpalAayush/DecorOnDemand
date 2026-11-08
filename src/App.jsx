import { Route, Routes } from 'react-router'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import  Signup  from './pages/Signup.jsx'
import Account from './pages/Account.jsx'
import Bookings from './pages/Bookings.jsx'
import Cart from './pages/Cart.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#2f2924]">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
