'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getAuthApiUrl, getConfig } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { AuthLayout } from './AuthLayout'
import { AlertCircle, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useTranslation } from '@/lib/hooks/use-translation'

export function LoginForm() {
  const { t, language } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useAuth()
  const { authRequired, checkAuthRequired, checkAuth, hasHydrated, isAuthenticated } = useAuthStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [configInfo, setConfigInfo] = useState<{ apiUrl: string; version: string; buildTime: string } | null>(null)
  const [authApiUrl, setAuthApiUrl] = useState('')
  const router = useRouter()

  // Load config info for debugging
  useEffect(() => {
    getConfig().then(cfg => {
      setConfigInfo({
        apiUrl: cfg.apiUrl,
        version: cfg.version,
        buildTime: cfg.buildTime,
      })
    }).catch(err => {
      console.error('Failed to load config:', err)
    })
  }, [])

  useEffect(() => {
    getAuthApiUrl().then(setAuthApiUrl).catch(err => {
      console.error('Failed to load auth API URL:', err)
    })
  }, [])

  // Check if authentication is required on mount
  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    const runChecks = async () => {
      try {
        const required = await checkAuthRequired()

        // If auth is not required, redirect to notebooks
        if (!required) {
          router.push('/notebooks')
          return
        }

        const authed = await checkAuth()
        if (authed) {
          router.push('/notebooks')
        }
      } catch (error) {
        console.error('Error checking auth requirement:', error)
        // On error, assume auth is required to be safe
      } finally {
        setIsCheckingAuth(false)
      }
    }

    // If we already know auth status, use it
    if (authRequired !== null) {
      if (!authRequired && isAuthenticated) {
        router.push('/notebooks')
      } else {
        setIsCheckingAuth(false)
      }
    } else {
      void runChecks()
    }
  }, [hasHydrated, authRequired, checkAuthRequired, checkAuth, router, isAuthenticated])

  // Show loading while checking if auth is required
  if (!hasHydrated || isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <LoadingSpinner className="text-white w-10 h-10" />
      </div>
    )
  }

  // If we still don't know if auth is required (connection error), show error
  if (authRequired === null) {
    return (
      <AuthLayout title={t.common.connectionError} subtitle={t.common.unableToConnect}>
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 font-medium">
                {error || t.auth.connectErrorHint}
              </div>
            </div>

            {configInfo && (
              <div className="space-y-2 text-xs text-muted-foreground border-t pt-3">
                <div className="font-medium">{t.common.diagnosticInfo}:</div>
                <div className="space-y-1 font-mono">
                  <div>{t.common.version}: {configInfo.version}</div>
                  <div>{t.common.built}: {new Date(configInfo.buildTime).toLocaleString(language === 'zh-CN' ? 'zh-CN' : language === 'zh-TW' ? 'zh-TW' : 'en-US')}</div>
                  <div className="break-all">{t.common.apiUrl}: {configInfo.apiUrl}</div>
                  <div className="break-all">{t.common.frontendUrl}: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
                </div>
                <div className="text-xs pt-2">
                  {t.common.checkConsoleLogs}
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t.common.retryConnection}
            </motion.button>
          </div>
      </AuthLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() && password.trim()) {
      try {
        await login(email, password)
      } catch (error) {
        console.error('Unhandled error during login:', error)
        // The auth store should handle most errors, but this catches any unhandled ones
      }
    }
  }

  return (
    <AuthLayout title={t.auth.loginTitle} subtitle={t.auth.loginDesc}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-10 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
              />
               <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {isLoading ? t.auth.signingIn : t.auth.signIn}
          </motion.button>

        <div className="flex justify-center">
            <Link
              href={email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : '/forgot-password'}
              className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground bg-opacity-90">Or continue with</span>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Use authApiUrl if available, otherwise use relative path (proxied through middleware)
              const oauthUrl = authApiUrl ? `${authApiUrl}/api/auth/google` : '/api/auth/google'
              window.location.href = oauthUrl
            }}
             className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all flex items-center justify-center gap-2"
          >
             <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12.0003 20.45c4.6667 0 7.95-3.2333 7.95-7.75 0-.8-.0833-1.4667-.2167-2.0667H12.0003v3.8667h4.5c-.2167 1.35-.9833 3.0167-2.8333 4.25l-.0258.1725 2.6517 2.0542.1833.0233c1.65-1.5333 2.625-3.8 2.625-6.55 0-.575-.05-1.15-.15-1.7h-6.95v-3.5h10.95c.1.55.15 1.125.15 1.7 0 5.425-3.625 9.275-9.2 9.275-5.275 0-9.55-4.275-9.55-9.55s4.275-9.55 9.55-9.55c2.475 0 4.7 1.025 6.3 2.7l2.8-2.8C18.2503 1.8 15.4253.9 12.0003.9c-6.125 0-11.1 4.975-11.1 11.1s4.975 11.1 11.1 11.1z" fill="currentColor" />
             </svg>
            Continue with Google
          </motion.button>

          <div className="text-sm text-center text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors">
              Create one
            </Link>
          </div>

          {configInfo && (
            <div className="text-xs text-center text-gray-400 pt-4 border-t border-gray-100">
              <span className="mr-2">v{configInfo.version}</span>
              <span className="font-mono text-[10px]">{configInfo.apiUrl}</span>
            </div>
          )}
        </form>
    </AuthLayout>
  )
}