"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { use } from "react"
import { Trophy, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DeckCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams() // <-- DIESE ZEILE HINZUFÜGEN

  // Funktion ersetzen
  const handleFinish = () => {
    const fromPath = searchParams.get("from")
    
    // Wenn 'fromPath' existiert, nutze ihn. Ansonsten falle auf '/decks' zurück.
    if (fromPath) {
      router.push(fromPath)
    } else {
      router.push("/decks")
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
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Success Icon */}
          <div className="relative">
            <div className="bg-green-100 rounded-full p-8">
              <Trophy className="w-20 h-20 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Star className="w-8 h-8 text-yellow-500 fill-current" />
            </div>
          </div>
          {/* Congratulations Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-800">Glückwunsch!</h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              Du hast das Deck erfolgreich abgeschlossen! Deine Antworten wurden gespeichert und helfen dabei, dein
              Lernfortschritt zu verfolgen.
            </p>
          </div>
          {/* Stats Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Lernsitzung beendet</h3>
            <div className="space-y-3 text-slate-600 text-base">
              <div className="flex justify-between">
                <span>Karten bearbeitet:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Deck:</span>
                <span className="font-medium">Deck {resolvedParams.id}</span>
              </div>
            </div>
          </div>
          {/* Action Button */}
          <Button
            onClick={handleFinish}
            className="bg-slate-800 hover:bg-slate-700 text-white px-12 py-4 text-xl font-semibold rounded-full"
          >
            BEENDEN
          </Button>
        </div>
      </main>
    </div>
  )
}
