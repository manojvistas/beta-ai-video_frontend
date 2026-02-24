'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuLabel,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Palette,
  Camera
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/hooks/use-translation'

export function UserProfileDropdown() {
  const { user, logout, updateAvatar } = useUserProfile()
  const { t } = useTranslation()
  const { isCollapsed } = useSidebarStore()
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()

  const displayName = user?.name || 'User'
  const displayEmail = user?.email || ''
  const displayPicture = user?.picture

  const initials = (displayName || 'User')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Max 5MB.')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        updateAvatar(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerUpload = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent dropdown closing
    // e.preventDefault() // Removed to allow click to propagate to input if needed, but we trigger ref manually
    fileInputRef.current?.click()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative h-16 w-full rounded-2xl overflow-hidden transition-all duration-300 group",
            isOpen ? "bg-sidebar-accent shadow-lg shadow-indigo-500/10" : "hover:bg-sidebar-accent hover:shadow-md",
            isCollapsed ? "px-0 justify-center" : "px-3 justify-start gap-3"
          )}
        >
          {/* Avatar with Gradient Ring */}
          <div className={cn(
            "relative flex items-center justify-center transition-all flex-shrink-0",
          )}>
            <div className={cn(
               "absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-70 blur-sm transition-opacity duration-500",
               isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )} />
            
            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-sidebar-background z-10 bg-indigo-50 dark:bg-zinc-800 shadow-sm">
                {displayPicture ? (
                  <Image src={displayPicture} alt={displayName} fill className="object-cover" unoptimized={displayPicture.startsWith('data:')} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white dark:from-zinc-800 dark:to-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                     {initials}
                  </div>
                )}
            </div>
            
            {/* Status Indicator */}
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-sidebar-background rounded-full z-20 shadow-sm" />
          </div>

          {!isCollapsed && (
            <motion.div 
               layoutId="sidebar-user-info"
               className="flex-1 text-left min-w-0 flex flex-col gap-0.5"
            >
              <span className="text-sm font-bold truncate text-sidebar-foreground">
                {displayName}
              </span>
              <span className="text-xs text-sidebar-foreground/60 truncate font-medium">
                {displayEmail}
              </span>
            </motion.div>
          )}

          {!isCollapsed && (
            <ChevronRight className={cn(
              "h-4 w-4 text-sidebar-foreground/40 transition-transform duration-300 ml-auto",
              isOpen ? "rotate-90 text-indigo-500" : "group-hover:text-indigo-500/50"
            )} />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-72 p-2 rounded-2xl border-sidebar-border/60 shadow-2xl backdrop-blur-xl bg-background/95" 
        align="start" 
        side="right" 
        sideOffset={16}
        collisionPadding={10}
        asChild
      >
        <motion.div
           initial={{ opacity: 0, x: -10, scale: 0.95 }}
           animate={{ opacity: 1, x: 0, scale: 1 }}
           exit={{ opacity: 0, x: -10, scale: 0.95 }}
           transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
           {/* Header in Dropdown */}
           <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100/50 dark:border-indigo-500/20 p-4 mb-2">
              <div className="flex items-center gap-4 relative z-10">
                 <div className="relative group/avatar cursor-pointer" onClick={triggerUpload}>
                    <div className="h-12 w-12 flex-shrink-0 relative rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md bg-white dark:bg-zinc-800">
                        {displayPicture ? (
                            <Image src={displayPicture} alt={displayName} fill className="object-cover" unoptimized={displayPicture.startsWith('data:')} />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-base font-bold">
                              {initials}
                            </div>
                        )}
                        
                        {/* Overlay with Camera Icon */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <Camera className="h-5 w-5 text-white" />
                        </div>
                    </div>
                 </div>
                 
                 {/* Hidden file input */}
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileSelect}
                 />

                 <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate text-foreground">{displayName}</span>
                    <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
                 </div>
              </div>
              
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl" />
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-20 w-20 rounded-full bg-gradient-to-tr from-pink-500/20 to-orange-500/20 blur-xl" />
           </div>

           <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-3 py-2 font-semibold">
              Account
           </DropdownMenuLabel>
           
           <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer gap-3 py-3 px-3 rounded-lg focus:bg-indigo-50 dark:focus:bg-indigo-950/30 font-medium transition-colors">
                 <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <User className="h-4 w-4" />
                 </div>
                 <span>Profile & Stats</span>
              </Link>
           </DropdownMenuItem>
           
           <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer gap-3 py-3 px-3 rounded-lg focus:bg-purple-50 dark:focus:bg-purple-950/30 font-medium transition-colors">
                 <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                    <Settings className="h-4 w-4" />
                 </div>
                 <span>Settings</span>
              </Link>
           </DropdownMenuItem>
           
           <DropdownMenuSeparator className="my-2 bg-border/50" />
           
           <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-3 py-2 font-semibold">
              Preferences
           </DropdownMenuLabel>

           <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-default group">
              <div className="flex items-center gap-3 text-sm font-medium">
                 <div className="p-1.5 rounded-md bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 group-hover:bg-pink-200 dark:group-hover:bg-pink-900 transition-colors">
                    <Palette className="h-4 w-4" />
                 </div>
                 <span>Theme</span>
              </div>
              <div className="scale-90 origin-right">
                  <ThemeToggle />
              </div>
           </div>
           
           <DropdownMenuSeparator className="my-2 bg-border/50" />
           
           <DropdownMenuItem 
              onClick={() => logout()}
              className="cursor-pointer gap-3 py-3 px-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 font-medium transition-colors mt-1"
           >
              <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
                 <LogOut className="h-4 w-4" />
              </div>
              <span>{t.common.signOut}</span>
           </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
