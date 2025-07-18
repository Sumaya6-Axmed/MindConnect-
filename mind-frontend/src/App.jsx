"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./App.css"

// Components
import Navbar from "./components/Navbar"
import Home from "./components/Home"
import About from "./components/About"
import Contact from "./components/Contact"
import Login from "./components/Login"
import Register from "./components/Register"
import UserDashboard from "./components/UserDashboard"
import TherapistDashboard from "./components/TherapistDashboard"
import AdminDashboard from "./components/AdminDashboard"
import AdminUserManagement from "./components/AdminUserManagement"
import AdminTherapistManagement from "./components/AdminTherapistManagement"
import AdminSessionManagement from "./components/AdminSessionManagement"
import AdminJournalManagement from "./components/AdminJournalManagement"
import AdminMotivationManagement from "./components/AdminMotivationManagement"
import NotificationList from "./components/NotificationList"
import JournalList from "./components/JournalList"
import JournalForm from "./components/JournalForm"
import SessionBooking from "./components/SessionBooking"
import SessionList from "./components/SessionList"
import MotivationContent from "./components/MotivationContent"
import TherapistList from "./components/TherapistList"
import Profile from "./components/Profile"

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [userType, setUserType] = useState(localStorage.getItem("userType"))

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [token])

  const handleLogin = (userData, authToken, type) => {
    setUser(userData)
    setToken(authToken)
    setUserType(type)
    localStorage.setItem("token", authToken)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("userType", type)
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    setUserType(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userType")
  }

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} userType={userType} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {userType === "therapist" ? (
                    <TherapistDashboard user={user} />
                  ) : user?.role?.name === "ADMIN" ? (
                    <AdminDashboard user={user} />
                  ) : (
                    <UserDashboard user={user} />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/journals"
              element={
                <ProtectedRoute>
                  <JournalList user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/new"
              element={
                <ProtectedRoute>
                  <JournalForm user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/edit/:id"
              element={
                <ProtectedRoute>
                  <JournalForm user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <SessionList user={user} userType={userType} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-session"
              element={
                <ProtectedRoute>
                  <SessionBooking user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapists"
              element={
                <ProtectedRoute>
                  <TherapistList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/motivation"
              element={
                <ProtectedRoute>
                  <MotivationContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile user={user} userType={userType} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationList user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/therapists"
              element={
                <ProtectedRoute>
                  <AdminTherapistManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sessions"
              element={
                <ProtectedRoute>
                  <AdminSessionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/motivation"
              element={
                <ProtectedRoute>
                  <AdminMotivationManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
