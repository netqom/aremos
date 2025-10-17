"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Lock, Mail, XCircle } from "lucide-react"

interface FormData {
  name: string
  licenseCode: string
  password: string
}

interface FormErrors {
  name?: string
  licenseCode?: string
  password?: string
  general?: string
}

const ERROR_MESSAGES: Record<string, string> = {
  'Name bereits vergeben': 'Dieser Name ist bereits registriert',
  'Ungültiger Lizenzcode': 'Der eingegebene Lizenzcode ist ungültig',
  'Falsches Passwort': 'Das eingegebene Passwort ist falsch',
  'Benutzer nicht gefunden': 'Kein Benutzer mit diesem Namen gefunden',
  'Login fehlgeschlagen': 'Anmeldung fehlgeschlagen',
  'Registrierung fehlgeschlagen': 'Registrierung fehlgeschlagen'
}

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    licenseCode: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setToken = (token: string) => {
    const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "aremos_token";
    // Set in localStorage for API calls
    localStorage.setItem(tokenKey, token);
    // Set in cookie for middleware
    document.cookie = `${tokenKey}=${token}; path=/; max-age=3600; SameSite=Strict`;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear field-specific error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setFormErrors({})

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
      
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
          code: formData.licenseCode
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - set token and redirect
        if (data.accessToken) {
          setToken(data.accessToken)
          router.push('/dashboard')
        } else {
          setFormErrors({ general: 'Unerwarteter Serverfehler' })
        }
      } else {
        // Handle specific error cases with neutral message and field marking
        const errorMessage = data.message || (isLogin ? 'Login fehlgeschlagen' : 'Registrierung fehlgeschlagen')
        const fieldToMark = data.field
        
        // Always show neutral message, but mark specific field red
        if (fieldToMark === 'name') {
          setFormErrors({ name: errorMessage })
        } else if (fieldToMark === 'licenseCode') {
          setFormErrors({ licenseCode: errorMessage })
        } else if (fieldToMark === 'password') {
          setFormErrors({ password: errorMessage })
        } else {
          setFormErrors({ general: errorMessage })
        }
      }
    } catch (error) {
      console.error('Network error:', error)
      setFormErrors({ 
        general: 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldError = (fieldName: keyof FormErrors) => {
    return formErrors[fieldName]
  }

  const hasFieldError = (fieldName: keyof FormErrors) => {
    return !!formErrors[fieldName]
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Toggle */}
      <div className="w-2/5" style={{ backgroundColor: "#4176A4" }}>
        <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
          <Image src="/images/aremos-logo.png" alt="AREMOS Logo" width={62} height={62} className="w-16 h-16" />
          <span className="text-3xl font-bold font-serif" style={{ color: "#121A4C" }}>
            AREMOS
          </span>
        </div>

        <div className="h-full flex flex-col justify-center items-center p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 border border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
          </div>

          {/* Toggle Content */}
          <div className="text-center z-10 max-w-md">
            <h1 className="text-5xl font-bold mb-10 font-serif" style={{ color: "#121A4C" }}>
              {isLogin ? "Willkommen!" : "Hallo!"}
            </h1>
            <p className="text-xl mb-3 opacity-90" style={{ color: "#121A4C" }}>
              {isLogin ? "Du hast noch keinen Account?" : "Du hast bereits einen Account?"}
            </p>
            <p className="text-xl mb-10 opacity-90" style={{ color: "#121A4C" }}>
              {isLogin ? "Registriere dich jetzt!" : "Melde dich an!"}
            </p>

            <Button
              onClick={() => setIsLogin(!isLogin)}
              variant="outline"
              size="lg"
              className="bg-transparent border-2 hover:bg-white hover:text-[#4176A4] px-14 py-7 text-lg font-semibold rounded-full transition-all duration-300"
              style={{ borderColor: "#121A4C", color: "#121A4C" }}
            >
              {isLogin ? "REGISTRIEREN" : "ANMELDEN"}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-3/5 flex flex-col justify-center items-center p-12" style={{ backgroundColor: "#ECF7FB" }}>
        <div className="w-full max-w-md">
          <h2 className="text-5xl font-bold mb-12 text-center font-serif" style={{ color: "#121A4C" }}>
            {isLogin ? "Anmeldung" : "Registrierung"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="relative w-full mx-auto">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4176A4] w-5 h-5" />
              <Input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className={`pl-12 py-8 text-lg bg-white border-2 rounded-xl focus:border-[#4176A4] focus:ring-[#4176A4] w-full ${
                  hasFieldError('name') ? 'border-red-500' : 'border-gray-200'
                }`}
                required
              />
              {hasFieldError('name') && (
                <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
              )}
              {getFieldError('name') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>
              )}
            </div>

            {/* License Code Field */}
            <div className="relative w-full mx-auto">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4176A4] w-5 h-5" />
              <Input
                type="text"
                name="licenseCode"
                placeholder="Lizenzcode"
                value={formData.licenseCode}
                onChange={handleInputChange}
                className={`pl-12 py-8 text-lg bg-white border-2 rounded-xl focus:border-[#4176A4] focus:ring-[#4176A4] w-full ${
                  hasFieldError('licenseCode') ? 'border-red-500' : 'border-gray-200'
                }`}
                required
              />
              {hasFieldError('licenseCode') && (
                <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
              )}
              {getFieldError('licenseCode') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('licenseCode')}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative w-full mx-auto">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4176A4] w-5 h-5" />
              <Input
                type="password"
                name="password"
                placeholder="Passwort"
                value={formData.password}
                onChange={handleInputChange}
                className={`pl-12 py-8 text-lg bg-white border-2 rounded-xl focus:border-[#4176A4] focus:ring-[#4176A4] w-full ${
                  hasFieldError('password') ? 'border-red-500' : 'border-gray-200'
                }`}
                required
              />
              {hasFieldError('password') && (
                <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
              )}
              {getFieldError('password') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('password')}</p>
              )}
            </div>

            {/* General Error */}
            {formErrors.general && (
              <div className="text-red-500 text-center text-sm mt-4">
                {formErrors.general}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-8 text-xl font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#4176A4", color: "#ECF7FB" }}
            >
              {isSubmitting ? "..." : (isLogin ? "ANMELDEN" : "REGISTRIEREN")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}