"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const NotificationList = ({ user }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }
      
      const response = await axios.get(`http://localhost:8080/api/notifications/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      setNotifications(response.data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const token = localStorage.getItem("token")
        await axios.delete(`http://localhost:8080/api/notifications/${notificationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchNotifications()
      } catch (error) {
        console.error("Error deleting notification:", error)
      }
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      SESSION_CANCELLED: "❌",
      SESSION_RESCHEDULED: "🔄",
      SESSION_COMPLETED: "✅",
      SESSION_REMINDER: "⏰",
    }
    return icons[type] || "📢"
  }

  const getNotificationColor = (type) => {
    const colors = {
      SESSION_CANCELLED: "bg-red-50 border-red-200",
      SESSION_RESCHEDULED: "bg-blue-50 border-blue-200",
      SESSION_COMPLETED: "bg-green-50 border-green-200",
      SESSION_REMINDER: "bg-yellow-50 border-yellow-200",
    }
    return colors[type] || "bg-gray-50 border-gray-200"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading notifications...</div>
      </div>
    )
  }

  if (!user || !user.id) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Please log in to view your notifications</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated with your session information</p>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                notification.read ? 'opacity-75' : ''
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl sm:text-3xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-3 text-sm sm:text-base">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                        <span>
                          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                        {!notification.read && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-xs sm:text-sm"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl sm:text-6xl mb-4">📢</div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              You're all caught up! New notifications will appear here when you have session updates.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationList 