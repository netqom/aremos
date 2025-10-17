"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { InsightData } from "@/lib/api-types"
import { COLORS } from "@/lib/styles"

interface InsightsModalProps {
  data: InsightData | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function InsightsModal({
  data,
  loading,
  error,
  onClose
}: InsightsModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="rounded-lg max-w-6xl w-full mx-4 h-5/6 relative overflow-hidden shadow-2xl border-4"
        style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.primary }}
      >
        <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: COLORS.primary }}>
          <h3 className="font-bold text-xl" style={{ color: COLORS.light }}>
            EINSICHT
          </h3>
          {!loading && !error && data && (
            <h2 className="text-xl font-bold" style={{ color: COLORS.light }}>
              LERNDATEN {data.deckName ? `VON "${data.deckName}"` : ""}
            </h2>
          )}
          <button
            onClick={onClose}
            className="hover:opacity-80 text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center border-2"
            style={{ color: COLORS.primary, backgroundColor: COLORS.light, borderColor: COLORS.primary }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 h-full">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-full p-4 text-center">
              <p className="text-white text-xl mb-4">{error}</p>
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-white text-[#121A4C] rounded-lg hover:bg-gray-100 font-semibold"
              >
                Schließen
              </button>
            </div>
          ) : !data ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-white text-xl">Keine Daten verfügbar</p>
            </div>
          ) : (
            <div className="p-6 overflow-y-auto h-full" style={{ backgroundColor: COLORS.light }}>
              {/* Metadaten */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-lg" style={{ color: COLORS.primary }}>
                    Letzter Besuch:
                  </span>
                  <div
                    className="px-6 py-2 rounded-full border-2"
                    style={{ backgroundColor: "white", borderColor: COLORS.primary }}
                  >
                    <span className="font-bold text-sm" style={{ color: COLORS.primary }}>
                      {data.lastVisitDate ? new Date(data.lastVisitDate).toLocaleDateString() : "Unbekannt"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-lg" style={{ color: COLORS.primary }}>
                    Letzte Lerndauer:
                  </span>
                  <div
                    className="px-6 py-2 rounded-full border-2"
                    style={{ backgroundColor: "white", borderColor: COLORS.primary }}
                  >
                    <span className="font-bold text-sm" style={{ color: COLORS.primary }}>
                      {data.lastDuration ? `${Math.round(data.lastDuration / 60000)} Minuten` : "Unbekannt"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance-Grid */}
              <div className="rounded-lg p-6 border-4" style={{ backgroundColor: COLORS.light, borderColor: "white" }}>
                <div
                  className="rounded-lg p-6 border-4 overflow-x-auto"
                  style={{
                    backgroundColor: COLORS.primary,
                    borderColor: "white",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${COLORS.accent} ${COLORS.primary}`,
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      width: 8px;
                      height: 8px;
                    }
                    div::-webkit-scrollbar-track {
                      background: ${COLORS.primary};
                    }
                    div::-webkit-scrollbar-thumb {
                      background: ${COLORS.accent};
                      border-radius: 4px;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                      background: ${COLORS.secondary};
                    }
                  `}</style>
                  
                  {data.sessions && data.sessions.length > 0 ? (
                    <div className="min-w-max">
                      {/* Erstelle ein Grid aus den Session-Daten */}
                      <div className="space-y-4">
                        {data.rounds && data.rounds.map((round: number, roundIndex: number) => (
                          <div key={roundIndex} className="flex items-center space-x-4">
                            <div className="text-lg font-bold w-8" style={{ color: COLORS.light }}>
                              R{round}
                            </div>
                            <div className="flex space-x-3">
                              {data.cards && data.cards.map((cardId: number, cardIndex: number) => {
                                // Finde die Interaktion für diese Karte in dieser Runde
                                const interaction = data.interactions && 
                                  data.interactions.find((i: any) => 
                                    i.round === round && i.cardId === cardId
                                  );
                                
                                // Bestimme den Status (richtig/falsch/nicht beantwortet)
                                let status = null;
                                if (interaction) {
                                  status = interaction.isCorrect;
                                }
                                
                                return (
                                  <div key={cardIndex} className="w-10 h-10 flex items-center justify-center">
                                    {status === true && (
                                      <Check className="w-6 h-6 text-green-400" />
                                    )}
                                    {status === false && (
                                      <X className="w-6 h-6 text-red-400" />
                                    )}
                                    {status === null && (
                                      <span className="text-gray-400 text-xl">-</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Kartenindices */}
                      <div className="flex items-center space-x-4 mt-4">
                        <div className="w-8"></div>
                        <div className="flex space-x-3">
                          {data.cards && data.cards.map((cardId: number, index: number) => (
                            <div key={index} className="text-sm text-center w-10" style={{ color: COLORS.light }}>
                              {index + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-40">
                      <p className="text-white">Keine Lernsessions in den letzten 7 Tagen</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
