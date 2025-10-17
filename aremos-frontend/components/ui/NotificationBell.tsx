"use client"

import { Bell, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/lib/notifications"

export function NotificationBell() {
  const router = useRouter()
  const {
    notifications,
    loading,
    showNotifications,
    setShowNotifications,
    handleNotificationHover,
    handleNotificationLeave,
    handleNotificationClick,
    unreadCount,
  } = useNotifications()

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 hover:bg-slate-100/20 rounded-full transition-colors relative"
        style={{ color: "#121A4C" }}
      >
        <Bell className="w-7 h-7" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Benachrichtigungen</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500">Lade Benachrichtigungen...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">Keine Benachrichtigungen</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 hover:bg-slate-50 cursor-pointer ${
                    notification.read_at ? "opacity-60" : ""
                  }`}
                  onMouseEnter={() => handleNotificationHover(notification.id)}
                  onMouseLeave={() => handleNotificationLeave(notification.id)}
                  onClick={() => handleNotificationClick(router)}
                >
                  <p className="text-sm text-slate-800 mb-1">{notification.message}</p>
                  <p className="text-xs text-slate-500">{notification.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
