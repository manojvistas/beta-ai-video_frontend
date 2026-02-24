'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { getAuthApiUrl } from '@/lib/config'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true

    const runVerify = async () => {
      if (!token) {
        setError('Verification token is missing.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const authApiUrl = await getAuthApiUrl()
         // Add a small delay for better UX so the loading spinner isn't instant
         await new Promise(r => setTimeout(r, 1500))

        const response = await fetch(`${authApiUrl}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const payload = await response.json().catch(() => null)

        if (!isMounted) return

        if (response.ok) {
          setSuccess(true)
        } else {
          setError(payload?.error || payload?.message || 'Verification failed')
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Verification failed')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void runVerify()

    return () => {
      isMounted = false
    }
  }, [token])

  return (
    <AuthLayout title="Verify Email" subtitle={isLoading ? "We are verifying your email..." : "Email verification result"}>
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        {isLoading && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative">
                     <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                     <Loader2 className="h-16 w-16 text-purple-600 animate-spin relative z-10" />
                </div>
                <p className="text-gray-500 animate-pulse">Checking token...</p>
            </motion.div>
        )}

        {success && (
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center gap-4 text-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                     <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Verified!</h3>
                <p className="text-gray-600">Your email has been successfully verified.</p>
                
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    onClick={() => router.push('/login')}
                  >
                    Go to Login
                  </motion.button>
            </motion.div>
        )}

        {error && !isLoading && (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center gap-4 text-center w-full"
            >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
                     <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Verification Failed</h3>
                 <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm w-full">
                  {error}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="mt-4 w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
                  onClick={() => router.push('/login')}
                >
                  Back to Login
                </motion.button>
            </motion.div>
        )}
      </div>
    </AuthLayout>
  )
}
