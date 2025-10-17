"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo, use } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Calendar, Paperclip, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { AppBackground } from "@/components/ui/AppBackground"
import { AppHeader } from "@/components/ui/AppHeader"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { api } from "@/lib/api"
import { logApiError, logUploadError } from "@/lib/error-handler"
import { monthNames, getDaysInMonth, getFirstDayOfMonth } from "@/lib/date"
import { COLORS, STYLES } from "@/lib/styles"
import { Card, Deck } from "@/lib/api-types"

interface Flashcard {
  id: number
  question: string
  answer: string
  imageUrl?: string
}

export default function DeckEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAttachmentModal, setShowAttachmentModal] = useState<"question" | "answer" | null>(null)
  const [showSpacedRepetitionModal, setShowSpacedRepetitionModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  // Aktuelle Datumseinstellungen
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [attachments, setAttachments] = useState<Record<string, File[]>>({})
  const [cards, setCards] = useState<Flashcard[]>([])
  
  // Laden der Deck-Daten beim Start
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    async function loadDeck() {
      setLoading(true)
      setError(null)
      
      try {
        // Lade Deck-Daten
        const deckData = await api<Deck>(`/api/decks/${resolvedParams.id}`, { signal })
        
        if (!signal.aborted) {
          // Konvertiere API-Karten zu Flashcards
          if (deckData.cards) {
            const flashcards: Flashcard[] = deckData.cards.map(card => ({
              id: card.id,
              question: card.front,
              answer: card.back,
              imageUrl: card.imageUrl
            }))
            setCards(flashcards)
          }
          
          // Lade Spaced Repetition Daten
          try {
            const srData = await api<{ dates: string[] }>(`/api/decks/${resolvedParams.id}/sr`, { signal })
            if (!signal.aborted && srData.dates) {
              setSelectedDates(new Set(srData.dates))
            }
          } catch (srError) {
            // SR-Daten sind optional, Fehler ignorieren
          }
        }
      } catch (err) {
        if (!signal.aborted) {
          logApiError(err, "Deck laden")
          setError("Das Deck konnte nicht geladen werden.")
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    }
    
    loadDeck()
    
    return () => controller.abort();
  }, [resolvedParams.id])

  // Karte löschen
  const handleDeleteCard = async () => {
    if (cards.length <= 1) {
      alert("Ein Deck muss mindestens eine Karte haben.")
      return
    }
    
    const currentCard = cards[currentCardIndex]
    
    if (window.confirm("Möchten Sie diese Karte wirklich löschen?")) {
      try {
        await api(`/api/decks/cards/${currentCard.id}`, { 
          method: "DELETE"
        })
        
        // Entferne Karte aus lokaler Liste
        const newCards = cards.filter((_, index) => index !== currentCardIndex)
        setCards(newCards)
        
        // Anpassung des Index falls nötig
        if (currentCardIndex >= newCards.length) {
          setCurrentCardIndex(Math.max(0, newCards.length - 1))
        }
      } catch (error) {
        logApiError(error, "Karte löschen", true)
      }
    }
  }

  // Zur nächsten Karte oder neue Karte erstellen
  const handleNextCard = async () => {
    // Speichere aktuelle Karte
    const currentCard = cards[currentCardIndex]
    if (currentCard) {
      try {
        await api(`/api/decks/cards/${currentCard.id}`, {
          method: "PUT",
          body: JSON.stringify({
            front: currentCard.question,
            back: currentCard.answer
          })
        })
      } catch (error) {
        logApiError(error, "Karte speichern")
      }
    }
    
    // Wenn wir am Ende der Liste sind, erstelle eine neue Karte
    if (currentCardIndex >= cards.length - 1) {
      try {
        const newCard = await api<Card>(`/api/decks/${resolvedParams.id}/cards`, {
          method: "POST",
          body: JSON.stringify({
            front: "Neue Frage",
            back: "Neue Antwort"
          })
        })
        
        const flashcard: Flashcard = {
          id: newCard.id,
          question: newCard.front,
          answer: newCard.back,
          imageUrl: newCard.imageUrl
        }
        setCards([...cards, flashcard])
        setCurrentCardIndex(cards.length)
      } catch (error) {
        logApiError(error, "Neue Karte erstellen", true)
      }
    } else {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  // Karte speichern
  const handleSaveCard = async () => {
    const currentCard = cards[currentCardIndex]
    
    if (!currentCard) return
    
    try {
      await api(`/api/decks/cards/${currentCard.id}`, {
        method: "PUT",
        body: JSON.stringify({
          front: currentCard.question,
          back: currentCard.answer
        })
      })
    } catch (error) {
      logApiError(error, "Karte speichern", true)
    }
  }

  // Bearbeitung abschließen - mit Versionierung
  const handleFinishEditing = async () => {
    try {
      // 1. Alle Karten-Änderungen speichern (triggert automatisch Versionierung)
      for (const card of cards) {
        if (card.id && card.id > 0) {
          // Bestehende Karte aktualisieren
          try {
            await api(`/api/cards/${card.id}`, {
              method: "PUT",
              body: JSON.stringify({
                question: card.question,
                answer: card.answer,
                questionImageUrl: card.questionImageUrl || null,
                answerImageUrl: card.answerImageUrl || null
              })
            })
          } catch (error) {
            console.warn(`Failed to update card ${card.id}:`, error)
          }
        } else if (card.question.trim() || card.answer.trim()) {
          // Neue Karte hinzufügen
          try {
            await api(`/api/decks/${resolvedParams.id}/cards`, {
              method: "POST",
              body: JSON.stringify({
                question: card.question,
                answer: card.answer,
                questionImageUrl: card.questionImageUrl || null,
                answerImageUrl: card.answerImageUrl || null
              })
            })
          } catch (error) {
            console.warn("Failed to add new card:", error)
          }
        }
      }
      
      // 2. Spaced Repetition Daten setzen (falls welche ausgewählt)
      if (selectedDates.size > 0) {
        try {
          await api(`/api/decks/${resolvedParams.id}/sr`, {
            method: "POST",
            body: JSON.stringify({
              days: Array.from(selectedDates)
            })
          })
        } catch (error) {
          console.warn("Failed to set SR dates:", error)
        }
      }
      
      alert("Deck erfolgreich aktualisiert!")
      router.push("/decks")
    } catch (error) {
      logApiError(error, "Bearbeitung abschließen", true)
    }
  }

  // Datei-Upload für Frage oder Antwort
  const uploadImage = async (file: File, side: 'question' | 'answer' = 'question') => {
    // Validierung
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    
    if (file.size > maxSize) {
      logUploadError(new Error("Datei zu groß (max. 10 MB)"), "Bild-Upload", true)
      return
    }
    
    if (!allowedTypes.includes(file.type)) {
      logUploadError(new Error("Dateityp nicht erlaubt (nur JPG/PNG/WebP)"), "Bild-Upload", true)
      return
    }
    
    try {
      const currentCard = cards[currentCardIndex]
      if (!currentCard.id || currentCard.id <= 0) {
        logUploadError(new Error("Karte muss erst gespeichert werden"), "Bild-Upload", true)
        return
      }
      
      const formData = new FormData()
      formData.append('file', file)
      
      // Upload direkt zu Card mit side Parameter
      const uploadResponse = await api<{ url: string }>(`/api/uploads/decks/${resolvedParams.id}/cards/${currentCard.id}/image?side=${side}`, {
        method: 'POST',
        body: formData
      })
      
      // Aktualisiere lokalen State
      const updatedCards = [...cards]
      updatedCards[currentCardIndex] = {
        ...currentCard,
        [side === 'answer' ? 'answerImageUrl' : 'questionImageUrl']: uploadResponse.url
      }
      setCards(updatedCards)
      
      // Update entsprechende State-Variable
      if (side === 'answer') {
        setAnswerImageUrl(uploadResponse.url)
      } else {
        setQuestionImageUrl(uploadResponse.url)
      }
      
      console.log(`✅ ${side === 'answer' ? 'Antwort' : 'Frage'}-Bild erfolgreich hochgeladen:`, uploadResponse.url)
    } catch (error) {
      logUploadError(error, "Bild-Upload", true)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Anhang entfernen
  const handleRemoveAttachment = async () => {
    const currentCard = cards[currentCardIndex]
    
    if (!currentCard.imageUrl) return
    
    try {
      await api(`/api/uploads/decks/${resolvedParams.id}/cards/${currentCard.id}/image`, {
        method: 'DELETE'
      })
      
      // Aktualisiere lokalen State
      const updatedCards = [...cards]
      updatedCards[currentCardIndex] = {
        ...currentCard,
        imageUrl: undefined
      }
      setCards(updatedCards)
      setImageUrl(null)
    } catch (error) {
      logApiError(error, "Bild entfernen", true)
    }
  }

  // Spaced Repetition speichern
  const handleConfirmSpacedRepetition = async () => {
    try {
      await api(`/api/decks/${resolvedParams.id}/sr`, {
        method: "POST",
        body: JSON.stringify({ dates: Array.from(selectedDates) })
      })
      
      setShowSpacedRepetitionModal(false)
    } catch (error) {
      logApiError(error, "Spaced Repetition Daten setzen", true)
    }
  }

  // Kalender-Logik
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const firstDayOfMonth = getFirstDayOfMonth(selectedYear, selectedMonth)

  // Memoize calendar rendering for performance
  const calendarDays = useMemo(() => {
    const days = []
    
    // Leere Zellen für Tage vor dem ersten Tag des Monats
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }
    
    // Tage des Monats
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const isSelected = selectedDates.has(date)
      
      days.push(
                  <button
          key={day}
          onClick={() => {
            const newDates = new Set(selectedDates)
            if (isSelected) {
              newDates.delete(date)
            } else {
              newDates.add(date)
            }
            setSelectedDates(newDates)
          }}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-colors ${
            isSelected
              ? "bg-[#4176A4] text-white"
              : "hover:bg-slate-100 text-slate-700"
          }`}
        >
          {day}
                  </button>
      )
    }
    
    return days
  }, [selectedYear, selectedMonth, firstDayOfMonth, daysInMonth, selectedDates])

  const currentCard = cards[currentCardIndex]

  if (loading) {
    return (
      <AppBackground>
        <AppHeader />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#121A4C]"></div>
        </div>
      </AppBackground>
    )
  }

  if (error) {
    return (
      <AppBackground>
        <AppHeader />
        <div className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
                        <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#4176A4] text-white rounded-lg hover:bg-[#335d87]"
                        >
            Erneut versuchen
                        </button>
                      </div>
      </AppBackground>
    )
  }

  return (
    <AppBackground>
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>
              Deck bearbeiten
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowSpacedRepetitionModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#6FA9D2] text-white rounded-lg hover:bg-[#4176A4]"
              >
                <Calendar className="w-5 h-5" />
                <span>Spaced Repetition</span>
              </Button>
              <Button
                onClick={handleFinishEditing}
                className="px-6 py-2 bg-[#4176A4] text-white rounded-lg hover:bg-[#335d87]"
              >
                Fertig
              </Button>
            </div>
          </div>
        </div>

        {cards.length > 0 && currentCard ? (
          <div className="space-y-8">
            {/* Card Navigation */}
            <div className="flex items-center justify-between">
          <Button
                onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                disabled={currentCardIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Vorherige</span>
          </Button>

              <span className="text-lg font-medium" style={{ color: COLORS.primary }}>
                Karte {currentCardIndex + 1} von {cards.length}
              </span>

          <Button
                onClick={handleNextCard}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
                <span>Nächste</span>
                <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

            {/* Card Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Question Side */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
                    Frage
                  </h2>
                  <Button
                    onClick={() => setShowAttachmentModal("question")}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>

                  <Textarea
                    value={currentCard.question}
                  onChange={(e) => {
                    const updatedCards = [...cards]
                    updatedCards[currentCardIndex] = {
                      ...currentCard,
                      question: e.target.value
                    }
                    setCards(updatedCards)
                  }}
                  className="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#4176A4]"
                  placeholder="Geben Sie hier die Frage ein..."
                />
            </div>

              {/* Answer Side */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
                    Antwort
                  </h2>
                  <Button
                    onClick={() => setShowAttachmentModal("answer")}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>

                  <Textarea
                    value={currentCard.answer}
                  onChange={(e) => {
                    const updatedCards = [...cards]
                    updatedCards[currentCardIndex] = {
                      ...currentCard,
                      answer: e.target.value
                    }
                    setCards(updatedCards)
                  }}
                  className="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#4176A4]"
                  placeholder="Geben Sie hier die Antwort ein..."
                />

                {/* Image Display */}
                {currentCard.imageUrl && (
                  <div className="mt-4">
                    <div className="relative">
                      <OptimizedImage
                        src={currentCard.imageUrl}
                        alt="Karteninhalt"
                        width={300}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                        <button
                        onClick={handleRemoveAttachment}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
            </div>
          </div>

            {/* Card Actions */}
            <div className="flex items-center justify-between">
            <Button
              onClick={handleDeleteCard}
              disabled={cards.length <= 1}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
                <Trash2 className="w-5 h-5" />
                <span>Karte löschen</span>
            </Button>

            <Button
                onClick={handleSaveCard}
                className="px-6 py-2 bg-[#4176A4] text-white rounded-lg hover:bg-[#335d87]"
              >
                Karte speichern
            </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">Keine Karten vorhanden.</p>
            <Button
              onClick={handleNextCard}
              className="px-6 py-2 bg-[#4176A4] text-white rounded-lg hover:bg-[#335d87]"
            >
              Erste Karte erstellen
            </Button>
          </div>
        )}
      </main>

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Anhang hinzufügen</h3>
              <button
                onClick={() => setShowAttachmentModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
                accept="image/*"
                onChange={handleFileSelect}
        className="hidden"
      />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-[#4176A4] text-white rounded-lg hover:bg-[#335d87]"
              >
                Bild auswählen
              </Button>
              <p className="text-sm text-slate-600">
                Unterstützte Formate: JPG, PNG, WebP (max. 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Spaced Repetition Modal */}
      {showSpacedRepetitionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Spaced Repetition planen</h3>
              <button
                onClick={() => setShowSpacedRepetitionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11)
                      setSelectedYear(selectedYear - 1)
                    } else {
                      setSelectedMonth(selectedMonth - 1)
                    }
                  }}
                  className="p-2 hover:bg-slate-100 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                  </button>
                <h4 className="font-medium">
                  {monthNames[selectedMonth]} {selectedYear}
                </h4>
                <button
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0)
                      setSelectedYear(selectedYear + 1)
                    } else {
                      setSelectedMonth(selectedMonth + 1)
                    }
                  }}
                  className="p-2 hover:bg-slate-100 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                  </button>
              </div>

              {/* Calendar */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"].map(day => (
                  <div key={day} className="p-2 font-medium text-slate-500">
                      {day}
                    </div>
                  ))}
                {calendarDays}
              </div>

              {/* Selected Dates Info */}
              {selectedDates.size > 0 && (
                <p className="text-sm text-slate-600">
                  {selectedDates.size} Wiederholungstermine ausgewählt
                </p>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowSpacedRepetitionModal(false)}
                  className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleConfirmSpacedRepetition}
                  className="flex-1 py-2 bg-[#4176A4] text-white rounded-lg hover:bg-[#335d87]"
                >
                  Speichern
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppBackground>
  )
}