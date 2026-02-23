'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAuthApiUrl } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AlertCircle, CheckCircle2, ArrowLeft, Mail, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const prefillEmail = searchParams.get('email') || ''
  const [email, setEmail] = useState(prefillEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail)
    }
  }, [prefillEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setIsLoading(true)

    try {
      const authApiUrl = await getAuthApiUrl()
      const response = await fetch(`${authApiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const payload = await response.json().catch(() => null)

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(payload?.error || payload?.message || 'Unable to send reset link')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
      return (
        <AuthLayout title="Check your email" subtitle="We've sent a password reset link">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-6"
            >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                     <p className="text-gray-600 mb-2">We sent a reset link to:</p>
                     <p className="font-semibold text-gray-900">{email}</p>
                </div>
                <p className="text-sm text-gray-500">
                    If you don't see it, check your spam folder.
                </p>

                 <div className="flex flex-col w-full gap-3 pt-4">
                    <Link 
                        href="/login"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-center"
                    >
                        Back to Login
                    </Link>
                     <button 
                        onClick={() => setSuccess(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                    >
                        Try with a different email
                    </button>
                 </div>
            </motion.div>
        </AuthLayout>
      )
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset link">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                 <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
                    />
                </div>
            </div>

            {error && (
                 <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </motion.div>
            )}

             <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading || !email.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </motion.button>

            <div className="text-center">
                <Link 
                    href="/login" 
                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                </Link>
            </div>
        </form>
    </AuthLayout>
  )
}
