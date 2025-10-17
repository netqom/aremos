"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { X, Bell, User } from "lucide-react"
import { useNotifications } from "@/lib/notifications"
import { NotificationPanel } from "@/components/ui/NotificationPanel"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { api, clearToken } from "@/lib/api"
import { COLORS, STYLES } from "@/lib/styles"
import { logApiError } from "@/lib/error-handler"

// Common styles for menu links
const menuLinkStyle = {
  color: COLORS.primary,
}

const headerBackgroundStyle = STYLES.appBackground;

interface AppHeaderProps {
  showBackButton?: boolean;
  backButtonUrl?: string;
  backButtonText?: string;
}

export function AppHeader({
  showBackButton = false,
  backButtonUrl = "/dashboard",
  backButtonText = "Zurück"
}: AppHeaderProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { items, markRead, loading: notificationsLoading } = useNotifications()
  const unreadCount = items.filter(item => !item.isRead).length
  const router = useRouter()

  const handleLogout = async () => {
    setShowProfileModal(false)
    try {
      await api("/api/auth/logout", { method: "POST" })
    } catch (err) {
      logApiError(err, "Logout", true)
    }
    clearToken()
    router.push("/login")
  }

  const handleDeleteProfile = async () => {
    if (window.confirm("Möchten Sie Ihr Profil wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      setShowProfileModal(false)
      try {
        await api("/api/auth/account", { method: "DELETE" })
        clearToken()
        router.push("/login")
      } catch (err) {
        logApiError(err, "Profil löschen", true)
      }
    }
  }

  return (
    <header className="pt-4" style={headerBackgroundStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center flex-1 justify-start">
            <div className="flex items-center space-x-12">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-slate-100/20 rounded-full transition-colors relative"
                  style={menuLinkStyle}
                >
                  <Bell className="w-7 h-7" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationPanel
                    notifications={items}
                    loading={notificationsLoading}
                    markRead={markRead}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              <Link href="/classrooms" className="font-bold text-lg transition-colors hover:opacity-80" style={menuLinkStyle}>
                Meine Classrooms
              </Link>
              <Link href="/decks" className="font-bold text-lg transition-colors hover:opacity-80" style={menuLinkStyle}>
                Meine Decks
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center flex-1">
            <button onClick={() => router.push("/dashboard")} className="hover:opacity-80 transition-opacity">
              <OptimizedImage 
                src="/images/aremos-logo.png" 
                alt="AREMOS" 
                width={78} 
                height={78} 
                className="w-20 h-20" 
                priority={true}
              />
            </button>
          </div>

          <div className="flex items-center flex-1 justify-end">
            <div className="flex items-center space-x-12">
              <Link href="/decks/create" className="font-bold text-lg transition-colors hover:opacity-80" style={menuLinkStyle}>
                Deck erstellen
              </Link>
              <Link href="/classrooms/1/admin" className="font-bold text-lg transition-colors hover:opacity-80" style={menuLinkStyle}>
                Classroom erstellen
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowProfileModal(!showProfileModal)}
                  className="p-2 hover:bg-slate-100/20 rounded-full transition-colors"
                  style={menuLinkStyle}
                >
                  <User className="w-7 h-7" />
                </button>

                {showProfileModal && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">Profiloptionen</h3>
                      <button
                        onClick={() => setShowProfileModal(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 space-y-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left p-3 hover:bg-slate-50 rounded transition-colors text-slate-800"
                      >
                        Ausloggen
                      </button>
                      <button
                        onClick={handleDeleteProfile}
                        className="w-full text-left p-3 hover:bg-slate-50 rounded transition-colors text-slate-800"
                      >
                        Profil löschen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay to close profile dropdown when clicking outside */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileModal(false)} 
        />
      )}
      
      {/* Overlay to close notifications when clicking outside */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)} 
        />
      )}
    </header>
  )
}