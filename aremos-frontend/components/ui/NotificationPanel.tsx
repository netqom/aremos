"use client"

import { X } from "lucide-react"
import { NotificationItem } from "@/lib/api-types"
import { createHoverHandlers } from "@/lib/notifications"
import { useRouter } from "next/navigation"

interface NotificationPanelProps {
  notifications: NotificationItem[];
  loading: boolean;
  markRead: (id: number) => void;
  onClose: () => void;
  onItemClick?: (notification: NotificationItem) => void;
}

export function NotificationPanel({ 
  notifications, 
  loading, 
  markRead, 
  onClose,
  onItemClick
}: NotificationPanelProps) {
  const router = useRouter();
  
  const handleItemClick = (notification: NotificationItem) => {
    if (onItemClick) {
      onItemClick(notification);
    } else {
      // Standard-Verhalten: Zur Decks-Seite navigieren
      router.push("/decks");
    }
  };
  
  return (
    <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Benachrichtigungen</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500">Benachrichtigungen werden geladen...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-500">Keine Benachrichtigungen</div>
        ) : (
          notifications.map((notification) => {
            const hoverProps = createHoverHandlers(notification.id, markRead);
            return (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-b-0 hover:bg-slate-50 ${notification.isRead ? "opacity-60" : ""} cursor-pointer`}
                onClick={() => handleItemClick(notification)}
                {...hoverProps}
              >
                <p className="text-sm font-medium text-slate-800 mb-1">{notification.title}</p>
                <p className="text-sm text-slate-600 mb-1">{notification.message}</p>
                <p className="text-xs text-slate-500">
                  {new Date(notification.expiresAt).toLocaleDateString("de-DE", { 
                    year: "numeric", 
                    month: "short", 
                    day: "numeric" 
                  })}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}