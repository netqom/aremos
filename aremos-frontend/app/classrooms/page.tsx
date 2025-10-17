"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, X } from "lucide-react"
import { NotificationBell } from "@/components/ui/NotificationBell"

export default function Classrooms() {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const router = useRouter()


  // Sample classroom data
  const classrooms = [
    { id: 1, name: "Mathematik 10a" },
    { id: 2, name: "Deutsch 9b" },
    { id: 3, name: "Englisch 11c" },
    { id: 4, name: "Geschichte 12a" },
    { id: 5, name: "Biologie 8b" },
    { id: 6, name: "Physik 10c" },
    { id: 7, name: "Chemie 11a" },
    { id: 8, name: "Französisch 9a" },
    { id: 9, name: "Spanisch 10b" },
    { id: 10, name: "Kunst 8a" },
  ]

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

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
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
                <NotificationBell />

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
                  className="font-bold text-lg transition-colors hover:opacity-80 whitespace-nowrap"
                  style={{ color: "#121A4C" }}
                >
                  Deck erstellen
                </Link>
                <Link
                  href="/classrooms/1/admin"
                  className="font-bold text-lg transition-colors hover:opacity-80 whitespace-nowrap"
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
                        <button
                          onClick={() => setShowProfileModal(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <h3 className="font-semibold text-slate-800">Profiloptionen</h3>
                      </div>
                      <div className="p-4 space-y-2 flex flex-col items-end">
                        <button
                          onClick={handleLogout}
                          className="text-right p-3 hover:bg-slate-50 rounded transition-colors text-slate-800"
                        >
                          Ausloggen
                        </button>
                        <button
                          onClick={handleDeleteProfile}
                          className="text-right p-3 hover:bg-slate-50 rounded transition-colors text-slate-800"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">MEINE CLASSROOMS</h1>
        </div>

        <div className="h-[calc(100vh-20rem)] overflow-y-auto pr-2">
          {/* Classrooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {classrooms.map((classroom) => (
              <Link key={classroom.id} href={`/classrooms/${classroom.id}`} className="group">
                <div
                  className="rounded-2xl p-6 h-48 flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  style={{ backgroundColor: "#121A4C" }}
                >
                  {/* Classroom Name */}
                  <h3 className="text-base font-semibold text-white mb-6 text-center">{classroom.name}</h3>

                  {/* Avatar Circle with Initial */}
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white/20">
                    <span className="text-xl font-bold text-slate-800">{getInitial(classroom.name)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}