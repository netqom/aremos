"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to login page in register mode
    router.replace('/login?mode=register')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Weiterleitung...</p>
    </div>
  )
}