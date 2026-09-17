import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Boxes, Users, Settings, LogOut, Search, Bell, X, User, Save, Shield, Mail, Sun, Moon } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import axios from 'axios'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken)
    setUsername(newUsername)
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const handleLogout = () => {
    setToken(null)
    setUsername('')
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    delete axios.defaults.headers.common['Authorization']
  }

  if (token && !axios.defaults.headers.common['Authorization']) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <MainLayout 
        username={username} 
        handleLogout={handleLogout} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </Router>
  )
}

function MainLayout({ username, handleLogout, searchQuery, setSearchQuery }) {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [globalProducts, setGlobalProducts] = useState([]);

  // Settings state
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    darkMode: false,
    language: 'English'
  });

  const isActive = (path) => location.pathname === path;
  const navItemClass = (path) => `flex items-center px-3 py-2 rounded-md transition-colors ${isActive(path) ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`;

  // Derive notifications from global products
  const notifications = globalProducts
    .filter(p => p.stock <= 15)
    .map(p => ({
      id: p.id,
      title: p.stock === 0 ? 'Out of Stock' : 'Low Stock Alert',
      message: `${p.name} (SKU: ${p.sku}) has reached ${p.stock || 0} units.`,
      type: p.stock === 0 ? 'critical' : 'warning'
    }));

  const unreadCount = notifications.length;

  return (
    <div className={settings.darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-10 shadow-xl">
          <div className="p-4 mb-4">
            <h1 className="text-white font-bold text-xl tracking-tight">Logix Global</h1>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            <Link to="/" className={navItemClass('/')}>
              <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
            </Link>
            <Link to="/products" className={navItemClass('/products')}>
              <Package className="mr-3 h-5 w-5" /> Products
            </Link>
            <Link to="/inventory" className={navItemClass('/inventory')}>
              <Boxes className="mr-3 h-5 w-5" /> Inventory
            </Link>
            <Link to="/users" className={navItemClass('/users')}>
              <Users className="mr-3 h-5 w-5" /> Users
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <div onClick={() => setShowSettings(true)} className="flex items-center text-slate-400 hover:text-white cursor-pointer mb-4 transition-colors">
              <Settings className="mr-3 h-5 w-5" /> Settings
            </div>
            <div onClick={handleLogout} className="flex items-center text-rose-400 hover:text-rose-300 cursor-pointer transition-colors">
              <LogOut className="mr-3 h-5 w-5" /> Logout
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm transition-colors duration-200">
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md px-3 py-1.5 w-96 focus-within:ring-2 focus-within:ring-indigo-500 transition-colors">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-300 mr-2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU or Product Name..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-400"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSettings({...settings, darkMode: !settings.darkMode})} 
                className="text-slate-400 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Toggle Dark Mode"
              >
                {settings.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => setShowNotifications(true)} className="text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white relative transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800"></span>
                )}
              </button>
              <div onClick={() => setShowProfile(true)} className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm uppercase cursor-pointer hover:bg-indigo-700 transition">
                {username ? username[0] : 'U'}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <Routes>
              <Route path="/" element={<Dashboard searchQuery={searchQuery} mode="full" onProductsUpdate={setGlobalProducts} />} />
              <Route path="/products" element={<Dashboard searchQuery={searchQuery} mode="products" onProductsUpdate={setGlobalProducts} />} />
              <Route path="/inventory" element={<Dashboard searchQuery={searchQuery} mode="inventory" onProductsUpdate={setGlobalProducts} />} />
              <Route path="/users" element={
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center transition-colors">
                  <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">User Management</h2>
                  <p className="text-slate-500 dark:text-slate-400">The User Management module allows assigning roles and managing access for warehouse staff.</p>
                  <div className="mt-6">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md border border-indigo-100 dark:border-indigo-800/50 font-medium transition-colors">
                      Current Admin: {username}
                    </div>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center"><Settings className="w-5 h-5 mr-2" /> Application Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Notifications</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center"><Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2"/> <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Alerts (Low Stock)</span></div>
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={settings.emailAlerts} onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${settings.emailAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.emailAlerts ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center"><Shield className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2"/> <span className="text-sm font-medium text-slate-700 dark:text-slate-300">SMS Alerts (Critical)</span></div>
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={settings.smsAlerts} onChange={(e) => setSettings({...settings, smsAlerts: e.target.checked})} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${settings.smsAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.smsAlerts ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Appearance & Region</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={settings.darkMode} onChange={(e) => setSettings({...settings, darkMode: e.target.checked})} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.darkMode ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</span>
                      <select 
                        className="border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3 transition-colors">
                <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition">Cancel</button>
                <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition flex items-center"><Save className="w-4 h-4 mr-2"/> Save Preferences</button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Slide-over */}
        {showNotifications && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-end z-50">
            <div className="bg-white dark:bg-slate-800 w-80 h-full shadow-2xl flex flex-col transform transition-transform border-l border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 transition-colors">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center"><Bell className="w-4 h-4 mr-2"/> Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900 transition-colors">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 mb-3">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">You're all caught up!</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All your products are sufficiently stocked.</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={`${n.id}-${i}`} className={`border p-3 rounded-md shadow-sm bg-white dark:bg-slate-800 transition-colors ${n.type === 'critical' ? 'border-rose-200 dark:border-rose-900 border-l-4 border-l-rose-500' : 'border-amber-200 dark:border-amber-900 border-l-4 border-l-amber-500'}`}>
                      <h4 className={`text-sm font-semibold ${n.type === 'critical' ? 'text-rose-800 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'}`}>{n.title}</h4>
                      <p className={`text-xs mt-1 ${n.type === 'critical' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>{n.message}</p>
                      <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-right">Just now</div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center transition-colors">
                  <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition">Mark all as read</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfile && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="px-6 pb-6 text-center relative">
                <button onClick={() => setShowProfile(false)} className="absolute top-2 right-2 text-white hover:text-slate-200 p-1 bg-black/20 rounded-full backdrop-blur-md"><X className="w-4 h-4"/></button>
                
                <div className="w-24 h-24 bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto -mt-12 text-4xl font-bold uppercase shadow-lg transition-colors">
                  {username ? username[0] : 'U'}
                </div>
                
                <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-3">{username}</h4>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-1">Administrator Role</p>
                
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between text-sm transition-colors">
                  <div className="text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{globalProducts.length}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-100">Sept '26</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Joined</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">Active</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Status</div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <button className="w-full py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition">Edit Profile</button>
                  <button onClick={handleLogout} className="w-full py-2 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-md text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50 transition">Log out</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
