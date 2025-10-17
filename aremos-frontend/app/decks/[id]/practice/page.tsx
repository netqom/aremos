"use client"

import { useState, use, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

interface Card {
  id: number
  question: string
  answer?: string
  questionImageUrl?: string | null
  answerImageUrl?: string | null
}

interface SessionData {
  sessionId: string
  totalCards: number
  roundIndex: number
  firstCard: Card | null
}

interface AnswerResponse {
  done?: boolean
  nextCard?: Card
  roundIndex?: number
  remaining?: number
}

export default function DeckPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // AREMOS state
  const [totalCards, setTotalCards] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [remainingInQueue, setRemainingInQueue] = useState(0)
  const [sessionStartTime] = useState(Date.now())
  
  const fromPath = searchParams.get("from")

  // Initialize session on component mount
  useEffect(() => {
    const startSession = async () => {
      try {
        setLoading(true)
        const response = await api<SessionData>(`/api/practice/${resolvedParams.id}/start`, {
          method: 'POST',
          body: JSON.stringify({})
        })
        
        setSessionId(response.sessionId)
        setTotalCards(response.totalCards)
        setCurrentRound(response.roundIndex)
        setCurrentCard(response.firstCard)
        setRemainingInQueue(response.totalCards) // Initially all cards in queue
        
        if (!response.firstCard) {
          setError('Deck hat keine Karten zum Lernen')
        }
      } catch (err) {
        console.error('Failed to start practice session:', err)
        setError('Fehler beim Starten der Lern-Session')
      } finally {
        setLoading(false)
      }
    }

    startSession()
  }, [resolvedParams.id])

  const handleReveal = () => {
    setShowAnswer(true)
  }
  
  const handleAnswer = async (isCorrect: boolean) => {
    if (!sessionId || !currentCard) return
    
    try {
      const response = await api<AnswerResponse>(`/api/practice/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          cardId: currentCard.id,
          isCorrect
        })
      })
      
      if (response.done) {
        // Session complete - finish and save insights
        await finishSession()
      } else if (response.nextCard) {
        // Move to next card
        setCurrentCard(response.nextCard)
        setCurrentRound(response.roundIndex || currentRound)
        setRemainingInQueue(response.remaining || 0)
        setShowAnswer(false)
      }
    } catch (err) {
      console.error('Failed to submit answer:', err)
      setError('Fehler beim Übermitteln der Antwort')
    }
  }

  const finishSession = async () => {
    if (!sessionId) return
    
    try {
      const durationMs = Date.now() - sessionStartTime
      const response = await api(`/api/practice/${sessionId}/finish`, {
        method: 'POST',
        body: JSON.stringify({ durationMs })
      })
      
      console.log('Session completed:', response)
      
      // Navigate to completion page
      const completionUrl = `/decks/${resolvedParams.id}/complete${fromPath ? `?from=${fromPath}` : ""}`
      router.push(completionUrl)
    } catch (err) {
      console.error('Failed to finish session:', err)
      // Still navigate to completion even if saving failed
      const completionUrl = `/decks/${resolvedParams.id}/complete${fromPath ? `?from=${fromPath}` : ""}`
      router.push(completionUrl)
    }
  }

  const handleEndSession = async () => {
    if (!sessionId) return
    
    try {
      await api(`/api/practice/${sessionId}/end`, {
        method: 'POST',
        body: JSON.stringify({})
      })
    } catch (err) {
      console.error('Failed to end session:', err)
    }
    
    // Navigate back
    router.push(fromPath || '/decks')
  }

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url(/images/app-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-slate-600 text-2xl font-medium">Lade Lern-Session...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url(/images/app-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center space-y-6">
          <div className="text-red-600 text-2xl font-medium">{error}</div>
          <Button
            onClick={() => router.push(fromPath || '/decks')}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
          >
            Zurück
          </Button>
        </div>
      </div>
    )
  }

  // No current card (shouldn't happen, but safety check)
  if (!currentCard) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url(/images/app-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center space-y-6">
          <div className="text-slate-600 text-2xl font-medium">Deck Complete!</div>
          <div className="text-slate-500 text-lg">Alle Karten erfolgreich gelernt.</div>
          <Button
            onClick={() => router.push(fromPath || '/decks')}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
          >
            Zurück zu Meine Decks
          </Button>
        </div>
      </div>
    )
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
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="flex flex-col items-center space-y-12">
          {/* AREMOS Progress Indicator */}
          <div className="text-center space-y-2">
            <div className="text-slate-600 font-medium text-2xl">
              Runde {currentRound} • {remainingInQueue} Karten in der Warteschlange
            </div>
            <div className="text-slate-500 text-lg">
              {totalCards} Karten gesamt • AREMOS Algorithmus
            </div>
          </div>

          {/* Flashcard Content */}
          <div className="w-full max-w-5xl bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl border-6 border-slate-800 p-20 min-h-[500px] flex items-center justify-center">
            <div className="text-center space-y-8">
              <div className="text-slate-800 text-3xl leading-relaxed">
                {showAnswer ? (currentCard.answer || 'Keine Antwort verfügbar') : currentCard.question}
              </div>
              
              {/* Show images if available */}
              {!showAnswer && currentCard.questionImageUrl && (
                <div className="flex justify-center">
                  <img 
                    src={currentCard.questionImageUrl} 
                    alt="Frage Bild" 
                    className="max-w-md max-h-64 object-contain rounded-lg"
                  />
                </div>
              )}
              
              {showAnswer && currentCard.answerImageUrl && (
                <div className="flex justify-center">
                  <img 
                    src={currentCard.answerImageUrl} 
                    alt="Antwort Bild" 
                    className="max-w-md max-h-64 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-6">
            {!showAnswer ? (
              <div className="flex space-x-4">
                <Button
                  onClick={handleEndSession}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
                >
                  Beenden
                </Button>
                <Button
                  onClick={handleReveal}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-16 py-6 text-2xl font-semibold rounded-full"
                >
                  AUFDECKEN
                </Button>
              </div>
            ) : (
              <div className="flex space-x-8">
                <Button
                  onClick={() => handleAnswer(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-14 py-6 text-2xl font-semibold rounded-full"
                >
                  FALSCH
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-14 py-6 text-2xl font-semibold rounded-full"
                >
                  RICHTIG
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}