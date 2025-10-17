"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Calendar, Paperclip, ChevronLeft, ChevronRight, X, Bell, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useNotifications } from "@/lib/notifications"
import { api } from "@/lib/api"

interface Flashcard {
  id: number
  question: string
  answer: string
}

export default function DeckCreatePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAttachmentModal, setShowAttachmentModal] = useState<"question" | "answer" | null>(null)
  const [showSpacedRepetitionModal, setShowSpacedRepetitionModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const { notifications, unreadCount, showNotifications, setShowNotifications, handleNotificationHover } =
    useNotifications()

  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set(["2023-03-04", "2023-03-19"]))
  const [attachments, setAttachments] = useState<Record<string, File[]>>({})
  const [cards, setCards] = useState<Flashcard[]>([{ id: 1, question: "", answer: "" }])
  const [isCreating, setIsCreating] = useState(false)

  const currentCard = cards[currentCardIndex]

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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateClick = (day: number) => {
    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const newSelectedDates = new Set(selectedDates)

    if (newSelectedDates.has(dateString)) {
      newSelectedDates.delete(dateString)
    } else {
      newSelectedDates.add(dateString)
    }

    setSelectedDates(newSelectedDates)
  }

  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1))
  }

  const handleMonthChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (selectedMonth === 0) {
        setSelectedMonth(11)
        setSelectedYear((prev) => prev - 1)
      } else {
        setSelectedMonth((prev) => prev - 1)
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0)
        setSelectedYear((prev) => prev + 1)
      } else {
        setSelectedMonth((prev) => prev + 1)
      }
    }
  }

  const handleCardUpdate = (field: "question" | "answer", value: string) => {
    setCards((prev) => prev.map((card) => (card.id === currentCard.id ? { ...card, [field]: value } : card)))
  }

  const handleDeleteCard = () => {
    if (cards.length > 1) {
      const newCards = cards.filter((card) => card.id !== currentCard.id)
      setCards(newCards)
      if (currentCardIndex >= newCards.length) {
        setCurrentCardIndex(newCards.length - 1)
      }
    }
  }

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
    }
  }

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    } else {
      const newCard: Flashcard = {
        id: Math.max(...cards.map((c) => c.id)) + 1,
        question: "",
        answer: "",
      }
      setCards((prev) => [...prev, newCard])
      setCurrentCardIndex(cards.length)
    }
  }

  const handleDeleteDeck = () => {
    if (confirm("Möchten Sie die Deck-Erstellung wirklich abbrechen?")) {
      router.push("/dashboard")
    }
  }

  const handleCreateDeck = async () => {
    if (isCreating) return // Verhindere doppeltes Klicken
    
    setIsCreating(true)
    
    try {
      console.log("🚀 Creating deck with backend...")
      
      // 1. Deck erstellen
      const deckResponse = await api<{ id: number; name: string }>("/api/decks", {
        method: "POST",
        body: JSON.stringify({ 
          name: "Neues Deck"
        })
      })
      
      console.log("✅ Deck created:", deckResponse)
      
      // 2. Karten hinzufügen (nur die mit Inhalt)
      const validCards = cards.filter(card => card.question.trim() || card.answer.trim())
      
      for (const card of validCards) {
        if (card.question.trim() || card.answer.trim()) {
          try {
            const cardResponse = await api(`/api/decks/${deckResponse.id}/cards`, {
              method: "POST", 
              body: JSON.stringify({
                question: card.question || "",
                answer: card.answer || ""
              })
            })
            console.log("✅ Card added:", cardResponse)
          } catch (cardError) {
            console.warn("⚠️ Failed to add card:", cardError)
          }
        }
      }
      
      // 3. Spaced Repetition Daten setzen (falls welche ausgewählt)
      if (selectedDates.size > 0) {
        try {
          const srResponse = await api(`/api/decks/${deckResponse.id}/sr`, {
            method: "POST",
            body: JSON.stringify({
              days: Array.from(selectedDates)
            })
          })
          console.log("✅ Spaced Repetition set:", srResponse)
        } catch (srError) {
          console.warn("⚠️ Failed to set SR dates:", srError)
        }
      }
      
      console.log("🎉 Deck creation completed successfully!")
      
      // Zurück zu Meine Decks
      router.push("/decks")
      
    } catch (error) {
      console.error("❌ Deck creation failed:", error)
      alert("Fehler beim Erstellen des Decks. Bitte versuchen Sie es erneut.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleSpacedRepetition = () => {
    setShowSpacedRepetitionModal(true)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0 && showAttachmentModal) {
      const attachmentKey = `${currentCard.id}-${showAttachmentModal}`
      setAttachments((prev) => ({
        ...prev,
        [attachmentKey]: [...(prev[attachmentKey] || []), ...Array.from(files)],
      }))
      setShowAttachmentModal(null)
    }
  }

  const handleRemoveAttachment = () => {
    if (showAttachmentModal) {
      const attachmentKey = `${currentCard.id}-${showAttachmentModal}`
      setAttachments((prev) => ({
        ...prev,
        [attachmentKey]: [],
      }))
      setShowAttachmentModal(null)
    }
  }

  const handleConfirmSpacedRepetition = () => {
    console.log("Spaced repetition dates set:", Array.from(selectedDates))
    setShowSpacedRepetitionModal(false)
  }

  const handleCancelSpacedRepetition = () => {
    setShowSpacedRepetitionModal(false)
  }

  const handleClose = () => {
    if (confirm("Möchten Sie die Deck-Erstellung wirklich abbrechen?")) {
      router.push("/dashboard")
    }
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
                            className="p-4 border-b last:border-b-0 hover:bg-slate-50"
                            onMouseEnter={() => handleNotificationHover(notification.id)}
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

      <main className="px-6 py-8 lg:px-12">
        <div className="flex items-center justify-center gap-8 mb-12">
          <Button
            onClick={handleDeleteDeck}
            className="rounded-full w-20 h-20 p-0"
            style={{ backgroundColor: "#121A4C", color: "#ECF7FB" }}
          >
            <Trash2 className="w-8 h-8" />
          </Button>

          <Button
            onClick={handleCreateDeck}
            disabled={isCreating}
            className="px-12 py-6 text-xl font-bold rounded-full"
            style={{ 
              backgroundColor: isCreating ? "#6b7280" : "#121A4C", 
              color: "#ECF7FB",
              opacity: isCreating ? 0.7 : 1
            }}
          >
            {isCreating ? "ERSTELLE..." : "DECK ERSTELLEN"}
          </Button>

          <Button
            onClick={handleSpacedRepetition}
            className="rounded-full w-20 h-20 p-0"
            style={{ backgroundColor: "#121A4C", color: "#ECF7FB" }}
          >
            <Calendar className="w-8 h-8" />
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center" style={{ color: "#121A4C" }}>
                Frage eingeben
              </h3>
              <div className="relative">
                <div
                  className="rounded-3xl p-8 border-4 shadow-xl min-h-[350px] relative"
                  style={{ backgroundColor: "#98B7D4", borderColor: "#121A4C" }}
                >
                  <button
                    onClick={() => setShowAttachmentModal(showAttachmentModal === "question" ? null : "question")}
                    className="absolute top-4 right-4 hover:opacity-80"
                    style={{ color: "#121A4C" }}
                  >
                    <Paperclip className="w-6 h-6" />
                  </button>

                  <Textarea
                    value={currentCard.question}
                    onChange={(e) => handleCardUpdate("question", e.target.value)}
                    placeholder="Frage eingeben..."
                    className="w-full h-full min-h-[250px] bg-transparent border-none resize-none text-lg placeholder:text-slate-600 focus:ring-0 focus:outline-none"
                  />

                  {showAttachmentModal === "question" && (
                    <div className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Datei anhängen</h3>
                        <button
                          onClick={() => setShowAttachmentModal(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        <button
                          onClick={handleFileUpload}
                          className="w-full text-left p-3 hover:bg-slate-50 rounded transition-colors text-slate-800 flex items-center gap-3"
                        >
                          <Paperclip className="w-4 h-4" />
                          Hinzufügen
                        </button>
                        <button
                          onClick={handleRemoveAttachment}
                          className="w-full text-left p-3 hover:bg-slate-50 rounded transition-colors text-slate-800 flex items-center gap-3"
                        >
                          <Trash2 className="w-4 h-4" />
                          Entfernen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center" style={{ color: "#121A4C" }}>
                Antwort eingeben
              </h3>
              <div className="relative">
                <div
                  className="rounded-3xl p-8 border-4 shadow-xl min-h-[350px] relative"
                  style={{ backgroundColor: "#98B7D4", borderColor: "#121A4C" }}
                >
                  <button
                    onClick={() => setShowAttachmentModal(showAttachmentModal === "answer" ? null : "answer")}
                    className="absolute top-4 right-4 hover:opacity-80"
                    style={{ color: "#121A4C" }}
                  >
                    <Paperclip className="w-6 h-6" />
                  </button>

                  <Textarea
                    value={currentCard.answer}
                    onChange={(e) => handleCardUpdate("answer", e.target.value)}
                    placeholder="Antwort eingeben..."
                    className="w-full h-full min-h-[250px] bg-transparent border-none resize-none text-lg placeholder:text-slate-600 focus:ring-0 focus:outline-none"
                  />

                  {showAttachmentModal === "answer" && (
                    <div className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Datei anhängen</h3>
                        <button
                          onClick={() => setShowAttachmentModal(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        <button
                          onClick={handleFileUpload}
                          className="w-full text-left p-3 hover:bg-slate-50 rounded transition-colors text-slate-800 flex items-center gap-3"
                        >
                          <Paperclip className="w-4 h-4" />
                          Hinzufügen
                        </button>
                        <button
                          onClick={handleRemoveAttachment}
                          className="w-full text-left p-3 hover:bg-slate-50 rounded transition-colors text-slate-800 flex items-center gap-3"
                        >
                          <Trash2 className="w-4 h-4" />
                          Entfernen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <Button
              onClick={handleDeleteCard}
              className="px-8 py-4 text-lg font-bold rounded-full"
              style={{ backgroundColor: "#121A4C", color: "#ECF7FB" }}
              disabled={cards.length <= 1}
            >
              KARTE LÖSCHEN
            </Button>

            <Button
              onClick={handlePreviousCard}
              className="px-8 py-4 text-lg font-bold rounded-full"
              style={{ backgroundColor: "#121A4C", color: "#ECF7FB" }}
              disabled={currentCardIndex === 0}
            >
              VORHERIGE KARTE
            </Button>

            <Button
              onClick={handleNextCard}
              className="px-8 py-4 text-lg font-bold rounded-full"
              style={{ backgroundColor: "#121A4C", color: "#ECF7FB" }}
            >
              NÄCHSTE KARTE
            </Button>
          </div>

          <div className="text-center mt-6">
            <span className="text-slate-600 text-lg">
              Karte {currentCardIndex + 1} von {cards.length}
            </span>
          </div>
        </div>
      </main>

      {showSpacedRepetitionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="rounded-3xl border-4 shadow-2xl max-w-lg w-full mx-4"
            style={{ backgroundColor: "#ECF7FB", borderColor: "#121A4C" }}
          >
            <div
              className="text-center py-6 rounded-t-2xl relative"
              style={{ backgroundColor: "#4176A4", color: "#ECF7FB" }}
            >
              <h2 className="text-2xl font-bold">SPACED REPETITION</h2>
              <button
                onClick={handleCancelSpacedRepetition}
                className="absolute top-4 right-4 hover:opacity-80"
                style={{ color: "#ECF7FB" }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center rounded-full px-6 py-3" style={{ backgroundColor: "#98B7D4" }}>
                  <button
                    onClick={() => handleYearChange("prev")}
                    className="hover:opacity-80"
                    style={{ color: "#121A4C" }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="mx-4 font-bold text-lg" style={{ color: "#121A4C" }}>
                    {selectedYear}
                  </span>
                  <button
                    onClick={() => handleYearChange("next")}
                    className="hover:opacity-80"
                    style={{ color: "#121A4C" }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div
                  className="flex items-center rounded-full px-6 py-3"
                  style={{ backgroundColor: "#ECF7FB", color: "#121A4C", border: "2px solid #121A4C" }}
                >
                  <button
                    onClick={() => handleMonthChange("prev")}
                    className="hover:opacity-80"
                    style={{ color: "#121A4C" }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="mx-4 font-bold text-lg">{monthNames[selectedMonth]}</span>
                  <button
                    onClick={() => handleMonthChange("next")}
                    className="hover:opacity-80"
                    style={{ color: "#121A4C" }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm font-bold py-3" style={{ color: "#4176A4" }}>
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: getFirstDayOfMonth(selectedYear, selectedMonth) }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-12"></div>
                  ))}

                  {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }).map((_, index) => {
                    const day = index + 1
                    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    const isSelected = selectedDates.has(dateString)

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                        style={
                          isSelected
                            ? { backgroundColor: "#121A4C", color: "#ECF7FB" }
                            : { color: "#121A4C", backgroundColor: "transparent" }
                        }
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "#6FA9D2"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "transparent"
                          }
                        }}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <Button
                  onClick={handleCancelSpacedRepetition}
                  className="px-10 py-3 rounded-full border-2 font-bold text-lg"
                  style={{
                    borderColor: "#121A4C",
                    color: "#121A4C",
                    backgroundColor: "transparent",
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleConfirmSpacedRepetition}
                  className="px-10 py-3 rounded-full font-bold text-lg"
                  style={{ backgroundColor: "#121A4C", color: "#ECF7FB" }}
                >
                  Festlegen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
