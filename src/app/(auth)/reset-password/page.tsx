'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAuthApiUrl } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AlertCircle, CheckCircle2, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Reset token is missing.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Reset token is missing.')
      return
    }

    if (!password.trim()) {
      setError('Password is required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const authApiUrl = await getAuthApiUrl()
      const response = await fetch(`${authApiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const payload = await response.json().catch(() => null)

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
           router.push('/login')
        }, 2000)
      } else {
        setError(payload?.error || payload?.message || 'Unable to reset password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
      return (
          <AuthLayout title="Password Reset" subtitle="Your password has been updated">
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-6"
            >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-800">Success!</h3>
                    <p className="text-gray-500 mt-2">Redirecting you to login...</p>
                </div>
            </motion.div>
          </AuthLayout>
      )
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a strong new password">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
                 <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 pr-10 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
                    />
                     <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                
                 <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 pr-10 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
                    />
                     <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
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
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {isLoading ? 'Updating...' : 'Reset Password'}
            </motion.button>
        </form>
    </AuthLayout>
  )
}
