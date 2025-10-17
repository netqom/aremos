"use client"

import { useState, useEffect, useRef } from "react"
import { api } from "./api"

export interface Notification {
  id: number
  message: string
  time: string
  deckId?: number
  deck?: { name: string }
  type: 'deck' | 'system'
  created_at: string
  read_at: string | null
  expires_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const hoverTimeouts = useRef<Record<number, NodeJS.Timeout>>({})

  // Fetch notifications from server
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await api<{
          items: Notification[]
          total: number
          unread: number
        }>('/api/notifications')
        
        // Transform server data to match UI expectations
        const transformedNotifications = response.items.map(item => ({
          ...item,
          message: item.type === 'deck' && item.deck 
            ? `Spaced Repetition für "${item.deck.name}" ist fällig`
            : item.message || 'Neue Benachrichtigung',
          time: formatTimeAgo(item.created_at)
        }))
        
        setNotifications(transformedNotifications)
        setUnreadCount(response.unread || 0)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        setNotifications([])
        setUnreadCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleNotificationHover = async (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (!notification || notification.read_at) return

    hoverTimeouts.current[notificationId] = setTimeout(async () => {
      try {
        if (notification.type === 'deck') {
          await api(`/api/notifications/${notificationId}/read`, { method: 'POST' })
        } else {
          await api(`/api/notifications/system/${notificationId}/read`, { method: 'POST' })
        }
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }, 1000)
  }

  const handleNotificationLeave = (notificationId: number) => {
    if (hoverTimeouts.current[notificationId]) {
      clearTimeout(hoverTimeouts.current[notificationId])
      delete hoverTimeouts.current[notificationId]
    }
  }

  const handleNotificationClick = (router?: any) => {
    setShowNotifications(false)
    if (router) {
      router.push('/decks')
    }
  }

  return {
    notifications,
    loading,
    showNotifications,
    setShowNotifications,
    handleNotificationHover,
    handleNotificationLeave,
    handleNotificationClick,
    unreadCount,
  }
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'vor wenigen Minuten'
  if (diffHours < 24) return `vor ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`
  return date.toLocaleDateString('de-DE')
}

// Helper function for creating hover handlers (legacy support)
export function createHoverHandlers(notificationId: number, markRead: (id: number) => void) {
  return {
    onMouseEnter: () => markRead(notificationId),
    onMouseLeave: () => {} // No-op for now
  }
}