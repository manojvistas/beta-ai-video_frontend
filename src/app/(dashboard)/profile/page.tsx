'use client'

import { useUserProfile } from '@/lib/hooks/use-user-profile'
import { motion } from 'framer-motion'
import { 
  User as UserIcon, 
  Mail, 
  Book, 
  Database, 
  Clock, 
  Save, 
  Upload,
  Sparkles,
  Trophy,
  Zap,
  Activity,
  ArrowLeft,
  Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, updateAvatar } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Max 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        updateAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Mock Stats
  const stats = [
    { label: 'Total Notebooks', value: 12, icon: Book, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Sources Added', value: 48, icon: Database, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Insights Generated', value: 156, icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30' },
    { label: 'Active Streak', value: '3 Days', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      {/* Animated Back Button */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed top-24 left-6 z-40 md:left-8"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full bg-background/40 backdrop-blur-md shadow-sm hover:shadow-md border border-white/20 hover:bg-background/60 text-foreground transition-all duration-300 group"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Dashboard</span>
        </Button>
      </motion.div>

      {/* Gradient Header */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Profile Card */}
          <motion.div variants={item} className="lg:col-span-1">
            <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group">
              <div className="p-6 flex flex-col items-center">
                <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative h-32 w-32 rounded-full border-4 border-card bg-card overflow-hidden shadow-inner cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {user?.picture ? (
                       <Image src={user.picture} alt="Profile" fill className="object-cover" unoptimized={user.picture.startsWith('data:')} />
                    ) : (
                       <div className="h-full w-full flex items-center justify-center bg-indigo-50 dark:bg-zinc-800 text-4xl font-bold text-indigo-500">
                          {user?.name?.[0] || 'U'}
                       </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <Camera className="h-8 w-8 text-white mb-1" />
                      <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
                    </div>
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2.5 rounded-full shadow-lg hover:scale-110 hover:shadow-indigo-500/25 transition-all"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-center mb-1">{user?.name || 'User'}</h2>
                <p className="text-muted-foreground text-center mb-6">{user?.email || 'user@example.com'}</p>

                <div className="w-full space-y-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Profile Completion</span>
                    <span className="text-indigo-500 font-bold">85%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form & Stats */}
          <motion.div variants={item} className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                >
                  <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Edit Profile Form */}
            <div className="bg-card rounded-3xl shadow-sm border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30 backdrop-blur-xl">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-indigo-500" />
                  Basic Information
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Full Name</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                      <Input defaultValue={user?.name || ''} className="pl-10 h-10 border-border/60 hover:border-indigo-500/50 focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all rounded-xl" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input defaultValue={user?.email || ''} readOnly className="pl-10 h-10 bg-muted/50 text-muted-foreground cursor-not-allowed rounded-xl border-transparent" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium ml-1">Bio</label>
                  <Textarea 
                    placeholder="Tell us about yourself..." 
                    className="min-h-[120px] resize-none border-border/60 hover:border-indigo-500/50 focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all rounded-xl"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    className="rounded-xl px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>

             {/* Activity (Placeholder for "Last Activity") */}
             <div className="bg-card rounded-3xl shadow-sm border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Last Activity
                  </h3>
                </div>
                <div className="p-6">
                   <div className="flex items-start gap-4 pb-6 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                         <Book className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                         <p className="font-medium text-sm">Edited "Project Beta" notebook</p>
                         <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" /> 2 hours ago
                         </p>
                      </div>
                   </div>
                </div>
             </div>

          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
