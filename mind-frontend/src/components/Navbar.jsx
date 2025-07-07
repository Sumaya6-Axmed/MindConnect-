"use client"
import { Link, useNavigate } from "react-router-dom"

const Navbar = ({ user, userType, onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate("/login")
  }

  const navLinkStyle =
    "text-gray-700 hover:text-indigo-600 font-medium text-sm transition-all duration-200 relative group"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center gap-3 group select-none"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform duration-200">
            MindConnect
          </span>
        </Link>

        {!user ? (
          <div className="flex items-center gap-6">
            <Link 
              to="/login" 
              className="text-gray-700 hover:text-indigo-600 font-semibold px-4 py-2 rounded-xl transition-all duration-200"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 text-white px-6 py-2.5 rounded-2xl font-bold shadow-md hover:from-indigo-600 hover:to-pink-500 hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className={navLinkStyle}>
                Dashboard
              </Link>

              {userType !== "therapist" && user?.role?.name !== "ADMIN" && (
                <>
                  <Link to="/journals" className={navLinkStyle}>Journals</Link>
                  <Link to="/sessions" className={navLinkStyle}>Sessions</Link>
                  <Link to="/book-session" className={navLinkStyle}>Book Session</Link>
                  <Link to="/therapists" className={navLinkStyle}>Therapists</Link>
                </>
              )}

              {userType === "therapist" && (
                <Link to="/sessions" className={navLinkStyle}>My Sessions</Link>
              )}

              <Link to="/motivation" className={navLinkStyle}>Motivation</Link>
              <Link to="/profile" className={navLinkStyle}>Profile</Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-gray-500 text-xs capitalize">{userType || user?.role?.name?.toLowerCase()}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
