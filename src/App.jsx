import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CreateDropPage from './pages/CreateDropPage'
import DropPage from './pages/DropPage'
import DashboardPage from './pages/DashboardPage'

// Temporary placeholders for future pages
const DemoPage = () => <div className="min-h-screen flex items-center justify-center text-white/50">Demo Page (Coming Soon)</div>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateDropPage />} />
        <Route path="/dashboard/:id" element={<DashboardPage />} />
        <Route path="/drop/:id" element={<DropPage />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
