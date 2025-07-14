"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import RescheduleModal from "./RescheduleModal"

const TherapistDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    todaySessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
  })
  const [todaySessions, setTodaySessions] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    session: null,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.get(`http://localhost:8080/api/sessions/therapist/${user.id}`, { headers })

      const sessions = response.data
      const today = new Date().toDateString()

      const todaySessionsList = sessions.filter((s) => new Date(s.sessionDate).toDateString() === today)

      const upcoming = sessions.filter((s) => s.status === "SCHEDULED" && new Date(s.sessionDate) > new Date())

      const completed = sessions.filter((s) => s.status === "COMPLETED")

      setTodaySessions(todaySessionsList)
      setUpcomingSessions(upcoming.slice(0, 5))

      setStats({
        totalSessions: sessions.length,
        todaySessions: todaySessionsList.length,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const updateSessionStatus = async (sessionId, status) => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      await axios.put(`http://localhost:8080/api/sessions/${sessionId}/status`, status, { headers })

      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error("Error updating session status:", error)
    }
  }

  const openRescheduleModal = (session) => {
    setRescheduleModal({
      isOpen: true,
      session: session,
    })
  }

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      session: null,
    })
  }

  const handleReschedule = () => {
    fetchDashboardData() // Refresh data after rescheduling
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setShowSearch(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      console.log("Therapist searching for:", searchTerm)

      const response = await axios.get(`http://localhost:8080/api/sessions/therapist/${user.id}`, { headers })
      const sessions = response.data

      console.log("Sessions data:", sessions)

      const filtered = sessions.filter(session => {
        const searchLower = searchTerm.toLowerCase()
        const firstNameMatch = session.user?.firstName?.toLowerCase().includes(searchLower)
        const lastNameMatch = session.user?.lastName?.toLowerCase().includes(searchLower)
        const emailMatch = session.user?.email?.toLowerCase().includes(searchLower)
        
        return firstNameMatch || lastNameMatch || emailMatch
      })

      console.log("Filtered sessions:", filtered)
      setSearchResults(filtered)
      setShowSearch(true)
    } catch (error) {
      console.error("Error searching:", error)
      alert("Error searching. Please try again.")
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setShowSearch(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, Dr. {user.firstName}!</h1>
        <p className="text-lg text-gray-600">Manage your therapy sessions and help your clients</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for your patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Search
            </button>
            {showSearch && (
              <button
                onClick={clearSearch}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((session) => (
                <div key={session.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {session.user.firstName} {session.user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      session.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSearch && searchResults.length === 0 && (
          <div className="mt-6 text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600">No patients found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todaySessions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingSessions}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedSessions}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Sessions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Today's Sessions</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <div key={session.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg transition-all duration-200 hover:border-indigo-500 hover:bg-gray-50 items-center">
                  <div className="text-sm text-gray-400">
                    {new Date(session.sessionDate).toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-800 mb-1">
                      {session.user?.firstName} {session.user?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">Type: {session.sessionType}</p>
                    <p className="text-sm text-gray-600 mb-2">Duration: {session.duration} minutes</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      session.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {session.status === "SCHEDULED" && (
                      <>
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors duration-200"
                          onClick={() => openRescheduleModal(session)}
                        >
                          Reschedule
                        </button>
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors duration-200"
                          onClick={() => updateSessionStatus(session.id, "COMPLETED")}
                        >
                          Complete
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors duration-200"
                          onClick={() => updateSessionStatus(session.id, "CANCELLED")}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No sessions scheduled for today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Sessions</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg transition-all duration-200 hover:border-indigo-500 hover:bg-gray-50 items-center">
                  <div className="text-sm text-gray-400">
                    {new Date(session.sessionDate).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })}
                    <br />
                    {new Date(session.sessionDate).toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-800 mb-1">
                      {session.user?.firstName} {session.user?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">Type: {session.sessionType}</p>
                    <p className="text-sm text-gray-600 mb-2">Duration: {session.duration} minutes</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      session.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {session.status === "SCHEDULED" && (
                      <>
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors duration-200"
                          onClick={() => openRescheduleModal(session)}
                        >
                          Reschedule
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors duration-200"
                          onClick={() => updateSessionStatus(session.id, "CANCELLED")}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RescheduleModal
        session={rescheduleModal.session}
        isOpen={rescheduleModal.isOpen}
        onClose={closeRescheduleModal}
        onReschedule={handleReschedule}
      />
    </div>
  )
}

export default TherapistDashboard
