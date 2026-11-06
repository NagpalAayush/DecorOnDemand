import { Route, Routes } from 'react-router'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'

function App() {
  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#2f2924]">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
