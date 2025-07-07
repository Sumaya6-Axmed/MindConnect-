"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AdminSessionManagement = () => {
  const [sessions, setSessions] = useState([])
  const [users, setUsers] = useState([])
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSession, setEditingSession] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    sessionDate: "",
    sessionType: "online",
    duration: 60,
    notes: "",
    status: "SCHEDULED",
    user: { id: "" },
    therapist: { id: "" }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const [sessionsRes, usersRes, therapistsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/sessions", { headers }),
        axios.get("http://localhost:8080/api/users", { headers }),
        axios.get("http://localhost:8080/api/therapists", { headers })
      ])

      setSessions(sessionsRes.data)
      setUsers(usersRes.data)
      setTherapists(therapistsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const sessionData = {
        ...formData,
        sessionDate: new Date(formData.sessionDate).toISOString()
      }

      if (editingSession) {
        await axios.put(`http://localhost:8080/api/sessions/${editingSession.id}`, sessionData, { headers })
      } else {
        await axios.post("http://localhost:8080/api/sessions", sessionData, { headers })
      }

      setShowForm(false)
      setEditingSession(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  const handleEdit = (session) => {
    setEditingSession(session)
    setFormData({
      sessionDate: new Date(session.sessionDate).toISOString().slice(0, 16),
      sessionType: session.sessionType,
      duration: session.duration,
      notes: session.notes || "",
      status: session.status,
      user: session.user,
      therapist: session.therapist
    })
    setShowForm(true)
  }

  const handleDelete = async (sessionId) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        await axios.delete(`http://localhost:8080/api/sessions/${sessionId}`, { headers })
        fetchData()
      } catch (error) {
        console.error("Error deleting session:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      sessionDate: "",
      sessionType: "online",
      duration: 60,
      notes: "",
      status: "SCHEDULED",
      user: { id: "" },
      therapist: { id: "" }
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: "blue",
      COMPLETED: "green",
      CANCELLED: "red",
      NO_SHOW: "orange",
    }
    return colors[status] || "gray"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading sessions...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Session Management</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingSession(null)
            resetForm()
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Add New Session
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {editingSession ? "Edit Session" : "Add New Session"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                <select
                  name="user"
                  value={formData.user.id}
                  onChange={(e) => setFormData({ ...formData, user: { id: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Therapist</label>
                <select
                  name="therapist"
                  value={formData.therapist.id}
                  onChange={(e) => setFormData({ ...formData, therapist: { id: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Therapist</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      Dr. {therapist.firstName} {therapist.lastName} ({therapist.specialization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  name="sessionDate"
                  value={formData.sessionDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="online">Online Session</option>
                  <option value="in-person">In-Person Session</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="4"
                placeholder="Session notes..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                {editingSession ? "Update Session" : "Create Session"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSession(null)
                  resetForm()
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Therapist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(session.sessionDate).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {session.user?.firstName} {session.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{session.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Dr. {session.therapist?.firstName} {session.therapist?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{session.therapist?.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.sessionType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.duration} min</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white`}
                      style={{ backgroundColor: getStatusColor(session.status) }}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(session)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminSessionManagement 