"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AdminJournalManagement = () => {
  const [journals, setJournals] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingJournal, setEditingJournal] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "NEUTRAL",
    tags: "",
    user: { id: "" }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const [journalsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:8080/api/journals", { headers }),
        axios.get("http://localhost:8080/api/users", { headers })
      ])

      setJournals(journalsRes.data)
      setUsers(usersRes.data)
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

      if (editingJournal) {
        await axios.put(`http://localhost:8080/api/journals/${editingJournal.id}`, formData, { headers })
      } else {
        await axios.post("http://localhost:8080/api/journals", formData, { headers })
      }

      setShowForm(false)
      setEditingJournal(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving journal:", error)
    }
  }

  const handleEdit = (journal) => {
    setEditingJournal(journal)
    setFormData({
      title: journal.title,
      content: journal.content,
      mood: journal.mood,
      tags: journal.tags || "",
      user: journal.user
    })
    setShowForm(true)
  }

  const handleDelete = async (journalId) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        await axios.delete(`http://localhost:8080/api/journals/${journalId}`, { headers })
        fetchData()
      } catch (error) {
        console.error("Error deleting journal:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      mood: "NEUTRAL",
      tags: "",
      user: { id: "" }
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      VERY_HAPPY: "😄",
      HAPPY: "😊",
      NEUTRAL: "😐",
      SAD: "😢",
      VERY_SAD: "😭",
      ANXIOUS: "😰",
      STRESSED: "😫",
      CALM: "😌",
      EXCITED: "🤩",
      ANGRY: "😠",
    }
    return moodEmojis[mood] || "😐"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading journals...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Journal Management</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingJournal(null)
            resetForm()
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Add New Journal Entry
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {editingJournal ? "Edit Journal Entry" : "Add New Journal Entry"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Give your entry a title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling? {getMoodEmoji(formData.mood)}
              </label>
              <select 
                name="mood" 
                value={formData.mood} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="VERY_HAPPY">😄 Very Happy</option>
                <option value="HAPPY">😊 Happy</option>
                <option value="EXCITED">🤩 Excited</option>
                <option value="CALM">😌 Calm</option>
                <option value="NEUTRAL">😐 Neutral</option>
                <option value="ANXIOUS">😰 Anxious</option>
                <option value="STRESSED">😫 Stressed</option>
                <option value="SAD">😢 Sad</option>
                <option value="VERY_SAD">😭 Very Sad</option>
                <option value="ANGRY">😠 Angry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="8"
                placeholder="Write about your day, feelings, thoughts, or anything on your mind..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="work, family, anxiety, gratitude (separate with commas)"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                {editingJournal ? "Update Entry" : "Save Entry"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingJournal(null)
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
          <h2 className="text-xl font-semibold text-gray-800">All Journal Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mood</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {journals.map((journal) => (
                <tr key={journal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {journal.user?.firstName?.charAt(0)}
                        {journal.user?.lastName?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {journal.user?.firstName} {journal.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{journal.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{journal.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getMoodEmoji(journal.mood)}</span>
                      <span className="text-sm text-gray-900">{journal.mood}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {journal.content.substring(0, 100)}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {journal.tags && (
                      <div className="flex flex-wrap gap-1">
                        {journal.tags.split(",").map((tag, index) => (
                          <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(journal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(journal)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(journal.id)}
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

export default AdminJournalManagement 