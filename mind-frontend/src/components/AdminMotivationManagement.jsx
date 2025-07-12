"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AdminMotivationManagement = () => {
  const [motivations, setMotivations] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingMotivation, setEditingMotivation] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "QUOTE",
    author: "",
    category: "",
    active: true
  })

  useEffect(() => {
    fetchMotivations()
  }, [])

  const fetchMotivations = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      const response = await axios.get("http://localhost:8080/api/motivations", { headers })
      setMotivations(response.data)
    } catch (error) {
      console.error("Error fetching motivations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      if (editingMotivation) {
        await axios.put(`http://localhost:8080/api/motivations/${editingMotivation.id}`, formData, { headers })
      } else {
        await axios.post("http://localhost:8080/api/motivations", formData, { headers })
      }

      setShowForm(false)
      setEditingMotivation(null)
      resetForm()
      fetchMotivations()
    } catch (error) {
      console.error("Error saving motivation:", error)
    }
  }

  const handleEdit = (motivation) => {
    setEditingMotivation(motivation)
    setFormData({
      title: motivation.title,
      content: motivation.content,
      type: motivation.type,
      author: motivation.author || "",
      category: motivation.category || "",
      active: motivation.active !== false
    })
    setShowForm(true)
  }

  const handleDelete = async (motivationId) => {
    if (window.confirm("Are you sure you want to delete this motivational content?")) {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        await axios.delete(`http://localhost:8080/api/motivations/${motivationId}`, { headers })
        fetchMotivations()
      } catch (error) {
        console.error("Error deleting motivation:", error)
      }
    }
  }

  const handleToggleActive = async (motivationId) => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      await axios.put(`http://localhost:8080/api/motivations/${motivationId}/toggle`, {}, { headers })
      fetchMotivations()
    } catch (error) {
      console.error("Error toggling motivation status:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "QUOTE",
      author: "",
      category: "",
      active: true
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const getTypeIcon = (type) => {
    const icons = {
      QUOTE: "💭",
      ARTICLE: "📖",
      TIP: "💡",
      EXERCISE: "🧘",
      VIDEO: "🎥",
      AUDIO: "🎧",
    }
    return icons[type] || "📝"
  }

  const getTypeColor = (type) => {
    const colors = {
      QUOTE: "#e3f2fd",
      ARTICLE: "#f3e5f5",
      TIP: "#fff3e0",
      EXERCISE: "#e8f5e8",
      VIDEO: "#fce4ec",
      AUDIO: "#f1f8e9",
    }
    return colors[type] || "#f5f5f5"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading motivational content...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Motivational Content Management</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingMotivation(null)
            resetForm()
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Add New Content
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {editingMotivation ? "Edit Content" : "Add New Content"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="QUOTE">Quote</option>
                  <option value="ARTICLE">Article</option>
                  <option value="TIP">Tip</option>
                  <option value="EXERCISE">Exercise</option>
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                {editingMotivation ? "Update Content" : "Add Content"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingMotivation(null)
                  resetForm()
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Motivational Content</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {motivations.map((motivation) => (
                <tr key={motivation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(motivation.type)}</span>
                      <span className="text-sm font-medium text-gray-900">{motivation.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{motivation.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {motivation.content.substring(0, 100)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {motivation.author || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {motivation.category || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      motivation.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {motivation.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(motivation)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(motivation.id)}
                      className={`mr-4 ${motivation.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {motivation.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(motivation.id)}
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

export default AdminMotivationManagement 