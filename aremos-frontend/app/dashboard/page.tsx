"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, X } from "lucide-react"
import { NotificationBell } from "@/components/ui/NotificationBell"

export default function Dashboard() {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const router = useRouter()


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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#121A4C" }}>
            <span style={{ color: "#4176A4" }}>A</span>ctive <span style={{ color: "#4176A4" }}>R</span>ecall{" "}
            <span style={{ color: "#4176A4" }}>E</span>ffective
            <br />
            <span style={{ color: "#4176A4" }}>M</span>emorizing <span style={{ color: "#4176A4" }}>O</span>nline{" "}
            <span style={{ color: "#4176A4" }}>S</span>ystem
          </h1>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: "#121A4C" }}>
            Organisiere dein Wissen, übe gezielt und wiederhole mit
            <br />
            System - für nachhaltigen Lernerfolg und das gute Gefühl,
            <br />
            bestens vorbereitet zu sein.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Meine Classrooms */}
          <Link href="/classrooms" className="group">
            <div
              className="rounded-2xl p-6 h-80 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              style={{ backgroundColor: "#6FA9D2" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#121A4C" }}>
                Meine Classrooms
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-40 flex items-center justify-center">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meine%20classrooms.PNG-CqIkGUZx2ULqFyHVyA4QG01vkRDDDh.png"
                    alt="Meine Classrooms"
                    width={210}
                    height={210}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </Link>

          {/* Meine Decks */}
          <Link href="/decks" className="group">
            <div
              className="rounded-2xl p-6 h-80 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              style={{ backgroundColor: "#4176A4" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#ECF7FB" }}>
                Meine Decks
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-40 flex items-center justify-center">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Deck%20erstellen.PNG-TrVsCAAn3bT0JyBFiu1oEvuEuGYxV8.png"
                    alt="Deck erstellen"
                    width={210}
                    height={210}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </Link>

          {/* Deck erstellen */}
          <Link href="/decks/create" className="group">
            <div
              className="rounded-2xl p-6 h-80 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              style={{ backgroundColor: "#121A4C" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#ECF7FB" }}>
                Deck erstellen
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-40 flex items-center justify-center">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meine%20decks.PNG-ARX6g6VCjdjn7z0BZE9mZeuzt30VkU.png"
                    alt="Meine Decks"
                    width={210}
                    height={210}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </Link>

          {/* Classroom erstellen */}
          <Link href="/classrooms/1/admin" className="group">
            <div
              className="rounded-2xl p-6 h-80 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              style={{ backgroundColor: "#98B7D4" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#121A4C" }}>
                Classroom erstellen
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-40 flex items-center justify-center">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Classroom%20erstellen.PNG-SxuFiM3pQl5KffOnl2l7TTgmTJe08d.png"
                    alt="Classroom erstellen"
                    width={210}
                    height={210}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}