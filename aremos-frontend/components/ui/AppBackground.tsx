"use client"

import { ReactNode } from "react"

interface AppBackgroundProps {
  children: ReactNode;
}

export function AppBackground({ children }: AppBackgroundProps) {
  const backgroundStyle = {
    backgroundImage: "url(/images/app-background.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  }
  
  return (
    <div className="min-h-screen" style={backgroundStyle}>
      {children}
    </div>
  )
}