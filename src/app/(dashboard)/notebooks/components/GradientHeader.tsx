'use client'

import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface GradientHeaderProps {
  title: string
  searchTerm: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
  searchPlaceholder?: string
}

export function GradientHeader({ 
  title, 
  searchTerm, 
  onSearchChange, 
  onRefresh,
  searchPlaceholder = "Search..."
}: GradientHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-lg overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRefresh}
            className="text-white hover:bg-white/20 hover:text-white rounded-full h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50 focus-visible:border-white h-10 rounded-xl"
            />
          </div>
          
          <div className="bg-white/20 rounded-lg p-1">
            <ThemeToggle iconOnly />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
