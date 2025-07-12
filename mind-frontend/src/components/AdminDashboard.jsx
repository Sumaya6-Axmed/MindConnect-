"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTherapists: 0,
    totalSessions: 0,
    totalJournals: 0,
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch all data
      const [usersRes, therapistsRes, sessionsRes, journalsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/users", { headers }),
        axios.get("http://localhost:8080/api/therapists", { headers }),
        axios.get("http://localhost:8080/api/sessions", { headers }),
        axios.get("http://localhost:8080/api/journals", { headers }),
      ])

      setStats({
        totalUsers: usersRes.data.length,
        totalTherapists: therapistsRes.data.length,
        totalSessions: sessionsRes.data.length,
        totalJournals: journalsRes.data.length,
      })

      setRecentUsers(usersRes.data.slice(-5).reverse())
      setRecentSessions(sessionsRes.data.slice(-5).reverse())
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
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

      const [usersRes, therapistsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/users", { headers }),
        axios.get("http://localhost:8080/api/therapists", { headers }),
      ])

      const allResults = [
        ...usersRes.data.map(user => ({ ...user, type: 'user' })),
        ...therapistsRes.data.map(therapist => ({ ...therapist, type: 'therapist' }))
      ]

      const filtered = allResults.filter(item => 
        item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.specialization && item.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
      )

      setSearchResults(filtered)
      setShowSearch(true)
    } catch (error) {
      console.error("Error searching:", error)
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">Manage the MindConnect platform</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for therapists and patients..."
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
              {searchResults.map((item) => (
                <div key={`${item.type}-${item.id}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {item.firstName?.[0]}{item.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.firstName} {item.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{item.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.type === 'therapist' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.type === 'therapist' ? 'Therapist' : 'Patient'}
                    </span>
                    {item.specialization && (
                      <span className="text-xs text-gray-600">{item.specialization}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSearch && searchResults.length === 0 && (
          <div className="mt-6 text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600">No results found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Therapists</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTherapists}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Journals</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalJournals}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Users</h2>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-800 mb-1">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                      <span className="text-xs text-gray-500">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No recent users</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Sessions</h2>
          </div>
          <div className="p-6">
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      📅
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-800 mb-1">Session #{session.id}</h4>
                      <p className="text-sm text-gray-600 mb-1">
                        User: {session.user?.firstName} {session.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Therapist: Dr. {session.therapist?.firstName} {session.therapist?.lastName}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        session.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        session.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No recent sessions</div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link to="/admin/users" className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium transition-all duration-200 hover:border-indigo-500 hover:bg-gray-50 hover:-translate-y-0.5">
            <span className="text-3xl">👥</span>
            Manage Users
          </Link>
          <Link to="/admin/therapists" className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium transition-all duration-200 hover:border-indigo-500 hover:bg-gray-50 hover:-translate-y-0.5">
            <span className="text-3xl">👨‍⚕️</span>
            Manage Therapists
          </Link>
          <Link to="/admin/sessions" className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium transition-all duration-200 hover:border-indigo-500 hover:bg-gray-50 hover:-translate-y-0.5">
            <span className="text-3xl">📅</span>
            Manage Sessions
          </Link>
          <Link to="/admin/journals" className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium transition-all duration-200 hover:border-indigo-500 hover:bg-gray-50 hover:-translate-y-0.5">
            <span className="text-3xl">📝</span>
            Manage Journals
          </Link>
          <Link to="/admin/motivation" className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium transition-all duration-200 hover:border-indigo-500 hover:bg-gray-50 hover:-translate-y-0.5">
            <span className="text-3xl">💪</span>
            Manage Motivation
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
