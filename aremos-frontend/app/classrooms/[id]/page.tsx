"use client"

import { useState, use } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { X, Bell, User, ArrowLeft } from "lucide-react"
import { useNotifications } from "@/lib/notifications"

interface Lesson {
  id: number
  title: string
  description: string
  resources: string[]
}

const lessons: Lesson[] = [
  {
    id: 1,
    title: "Lektion 1",
    description:
      "Dies ist die Beschreibung für Lektion 1. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 1", "Stufe 1", "Stufe 1"],
  },
  {
    id: 2,
    title: "Lektion 2",
    description:
      "Dies ist die Beschreibung für Lektion 2. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 2", "Stufe 2"],
  },
  {
    id: 3,
    title: "Lektion 3",
    description:
      "Dies ist die Beschreibung für Lektion 3. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 3"],
  },
  {
    id: 4,
    title: "Lektion 4",
    description:
      "Dies ist die Beschreibung für Lektion 4. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 4", "Stufe 4", "Stufe 4", "Stufe 4"],
  },
  {
    id: 5,
    title: "Lektion 5",
    description:
      "Dies ist die Beschreibung für Lektion 5. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: ["Stufe 5", "Stufe 5"],
  },
  {
    id: 6,
    title: "Lektion 6",
    description:
      "Dies ist die Beschreibung für Lektion 6. Hier finden Sie alle wichtigen Informationen zu dieser Lektion.",
    resources: [],
  },
]

export default function ClassroomDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons[0])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const {
    notifications,
    readNotifications,
    showNotifications,
    setShowNotifications,
    handleNotificationHover,
    handleNotificationLeave,
    unreadCount,
  } = useNotifications()

  const handleLogout = () => {
    setShowProfileModal(false)
    router.push("/")
  }

  const handleDeleteProfile = () => {
    setShowProfileModal(false)
    router.push("/")
  }

  const handleLogoClick = () => {
    router.push("/dashboard")
  }

  const handleBackToClassrooms = () => {
    router.push("/classrooms")
  }

  const handleResourceClick = (resource: string) => {
    router.push(`/decks/1/practice?from=${pathname}`)
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url(/images/app-background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header
        className="pt-4"
        style={{
          backgroundImage: "url(/images/app-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center flex-1 justify-start">
              <div className="flex items-center space-x-12">
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
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b last:border-b-0 hover:bg-slate-50 ${readNotifications.has(notification.id) ? "opacity-60" : ""}`}
                            onMouseEnter={() => handleNotificationHover(notification.id)}
                            onMouseLeave={() => handleNotificationLeave(notification.id)}
                          >
                            <p className="text-sm text-slate-800 mb-1">{notification.message}</p>
                            <p className="text-xs text-slate-500">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/classrooms"
                  className="font-bold text-lg transition-colors hover:opacity-80"
                  style={{ color: "#121A4C" }}
                >
                  Meine Classrooms
                </Link>
                <Link
                  href="/decks"
                  className="font-bold text-lg transition-colors hover:opacity-80"
                  style={{ color: "#121A4C" }}
                >
                  Meine Decks
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center flex-1">
              <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity">
                <Image src="/images/aremos-logo.png" alt="AREMOS" width={78} height={78} className="w-20 h-20" />
              </button>
            </div>

            <div className="flex items-center flex-1 justify-end">
              <div className="flex items-center space-x-12">
                <Link
                  href="/decks/create"
                  className="font-bold text-lg transition-colors hover:opacity-80"
                  style={{ color: "#121A4C" }}
                >
                  Deck erstellen
                </Link>
                <Link
                  href="/classrooms/1/admin"
                  className="font-bold text-lg transition-colors hover:opacity-80"
                  style={{ color: "#121A4C" }}
                >
                  Classroom erstellen
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileModal(!showProfileModal)}
                    className="p-2 hover:bg-slate-100/20 rounded-full transition-colors"
                    style={{ color: "#121A4C" }}
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
      </header>

      {/* Classroom Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-lg flex items-center justify-between py-4 px-6" style={{ backgroundColor: "#121A4C" }}>
          <button
            onClick={handleBackToClassrooms}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
            style={{ backgroundColor: "#ECF7FB", color: "#121A4C" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Zurück</span>
          </button>

          <h1 className="text-xl font-semibold" style={{ color: "#ECF7FB" }}>
            CLASSROOM NAME
          </h1>

          <div style={{ width: "120px" }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Lessons */}
          <div className="w-80 space-y-2">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`w-full p-4 rounded-lg text-left font-medium transition-colors ${
                  selectedLesson.id === lesson.id ? "border-2" : "border-2 hover:opacity-80"
                }`}
                style={{
                  backgroundColor: selectedLesson.id === lesson.id ? "#98B7D4" : "#ECF7FB",
                  borderColor: "#121A4C",
                  color: "#121A4C",
                }}
              >
                {lesson.title}
              </button>
            ))}
          </div>

          {/* Right Content - Lesson Details */}
          <div className="flex-1 space-y-6">
            {/* Lesson Title */}
            <div className="rounded-lg p-6" style={{ backgroundColor: "#98B7D4" }}>
              <h2 className="text-2xl font-bold" style={{ color: "#121A4C" }}>
                {selectedLesson.title}
              </h2>
            </div>

            {/* Description */}
            <div className="rounded-lg p-6" style={{ backgroundColor: "#98B7D4" }}>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4" style={{ color: "#121A4C" }}>
                  Beschreibung
                </h3>
                <p style={{ color: "#121A4C" }}>{selectedLesson.description}</p>
              </div>
            </div>

            {/* Resources */}
            <div className="rounded-lg p-6 border" style={{ backgroundColor: "#ECF7FB", borderColor: "#121A4C" }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: "#121A4C" }}>
                Ressourcen
              </h3>
              {selectedLesson.resources.length > 0 ? (
                <div className="space-y-2">
                  {selectedLesson.resources.map((resource, index) => (
                    <button
                      key={index}
                      onClick={() => handleResourceClick(resource)}
                      className="flex items-center space-x-2 hover:opacity-80 transition-colors"
                      style={{ color: "#121A4C" }}
                    >
                      <span style={{ color: "#4176A4" }}>📄</span>
                      <span>{resource}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#121A4C", opacity: 0.7 }}>Keine Ressourcen verfügbar</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Overlay */}
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
    </div>
  )
}