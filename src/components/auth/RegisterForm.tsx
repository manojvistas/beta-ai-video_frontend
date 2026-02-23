'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { getAuthApiUrl } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { AuthLayout } from './AuthLayout'
import { AlertCircle, CheckCircle2, Eye, EyeOff, User, Mail, Lock, Loader2 } from 'lucide-react'
import { useTranslation } from '@/lib/hooks/use-translation'

export function RegisterForm() {
    const { t } = useTranslation()
    const router = useRouter()
    const { register, isLoading, error } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [success, setSuccess] = useState(false)
    const [authApiUrl, setAuthApiUrl] = useState('')
    const [localError, setLocalError] = useState<string | null>(null)

    const getPasswordStrength = (value: string) => {
        let score = 0
        if (value.length >= 8) score += 1
        if (/[a-z]/.test(value)) score += 1
        if (/[A-Z]/.test(value)) score += 1
        if (/[0-9]/.test(value)) score += 1
        if (/[^A-Za-z0-9]/.test(value)) score += 1

        if (score <= 2) return { label: 'Weak', level: 1, color: 'bg-red-500' }
        if (score <= 4) return { label: 'Medium', level: 2, color: 'bg-yellow-500' }
        return { label: 'Strong', level: 3, color: 'bg-emerald-500' }
    }

    const passwordStrength = password ? getPasswordStrength(password) : null

    const handleGoogleLogin = () => {
        // Use authApiUrl if available, otherwise use relative path (proxied through middleware)
        const oauthUrl = authApiUrl ? `${authApiUrl}/api/auth/google` : '/api/auth/google'
        window.location.href = oauthUrl
    }

    useEffect(() => {
        getAuthApiUrl().then(setAuthApiUrl).catch(err => {
            console.error('Failed to load auth API URL:', err)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError(null)

        if (!name.trim() || !email.trim() || !password.trim()) {
            setLocalError('All fields are required.')
            return
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match.')
            return
        }

        if (password.length < 8) {
            setLocalError('Password must be at least 8 characters.')
            return
        }

        const ok = await register(name.trim(), email.trim(), password)
        if (ok) {
            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        }
    }

    if (success) {
        return (
            <AuthLayout title="Check your inbox" subtitle="Registration successful">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center space-y-6"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                    >
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </motion.div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Account Created Successfully!</h3>
                        <p className="text-gray-600 mt-2 mb-1">We've sent a verification link to</p>
                        <p className="font-semibold text-gray-900">{email}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                        Please check your email to verify your account before logging in.
                    </p>
                    <p className="text-xs text-gray-400">Redirecting to login in 3 seconds...</p>
                    
                     <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        onClick={() => router.push('/login')}
                    >
                        Go to login
                    </motion.button>
                </motion.div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout title="Create Account" subtitle="Register to access Open Notebook">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                             className="pl-10 h-11 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
                        />
                    </div>
                    <div className="relative group">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {passwordStrength && (
                        <div className="space-y-1 px-1">
                            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ 
                                        width: passwordStrength.level === 1 ? '33%' : passwordStrength.level === 2 ? '66%' : '100%',
                                    }}
                                    className={`h-full ${passwordStrength.color}`}
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Strength</span>
                                <span className={`font-medium ${passwordStrength.level === 1 ? 'text-red-500' : passwordStrength.level === 2 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl transition-all"
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

                {(localError || error) && (
                     <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                    >
                        <AlertCircle className="h-4 w-4" />
                        {localError || error}
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
                    {isLoading ? t.auth.signingIn : 'Create Account'}
                </motion.button>

                <div className="relative py-2">
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

                    onClick={handleGoogleLogin}
                     className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all flex items-center justify-center gap-2"
                >
                    <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M12.0003 20.45c4.6667 0 7.95-3.2333 7.95-7.75 0-.8-.0833-1.4667-.2167-2.0667H12.0003v3.8667h4.5c-.2167 1.35-.9833 3.0167-2.8333 4.25l-.0258.1725 2.6517 2.0542.1833.0233c1.65-1.5333 2.625-3.8 2.625-6.55 0-.575-.05-1.15-.15-1.7h-6.95v-3.5h10.95c.1.55.15 1.125.15 1.7 0 5.425-3.625 9.275-9.2 9.275-5.275 0-9.55-4.275-9.55-9.55s4.275-9.55 9.55-9.55c2.475 0 4.7 1.025 6.3 2.7l2.8-2.8C18.2503 1.8 15.4253.9 12.0003.9c-6.125 0-11.1 4.975-11.1 11.1s4.975 11.1 11.1 11.1z" fill="currentColor" />
                    </svg>
                    Continue with Google
                </motion.button>

                <div className="text-sm text-center text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors">
                        Sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    )
}
