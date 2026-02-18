'use client'

import { NotebookResponse } from '@/lib/types/api'
import { NotebookCard } from './NotebookCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Book, ChevronDown, ChevronRight, Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useTranslation } from '@/lib/hooks/use-translation'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface NotebookListProps {
  notebooks?: NotebookResponse[]
  isLoading: boolean
  title: string
  collapsible?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onAction?: () => void
  actionLabel?: string
}

function NotebookListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[220px] rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-8 pt-4 border-t flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyIllustration() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-primary/5 p-6 rounded-full mb-6">
        <FolderOpen className="h-12 w-12 text-primary/60" />
      </div>
    </div>
  )
}

export function NotebookList({ 
  notebooks, 
  isLoading, 
  title, 
  collapsible = false,
  emptyTitle,
  emptyDescription,
  onAction,
  actionLabel,
}: NotebookListProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(!collapsible)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Skeleton className="h-6 w-32" />
        </div>
        <NotebookListSkeleton />
      </div>
    )
  }

  if (!notebooks || notebooks.length === 0) {
    if (collapsible) return null // Hide archived section if empty

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/30 border-2 border-dashed rounded-2xl">
        <EmptyIllustration />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {emptyTitle ?? t.common.noResults}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-center">
          {emptyDescription ?? t.chat.startByCreating}
        </p>
        
        {onAction && actionLabel && (
          <Button onClick={onAction} size="lg" className="rounded-full px-8 shadow-md">
            <Plus className="h-5 w-5 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0 h-6 w-6 rounded-full hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        <h2 className="text-lg font-semibold tracking-tight text-foreground/80 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {notebooks.length}
          </span>
        </h2>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {notebooks.map((notebook, index) => (
              <NotebookCard key={notebook.id} notebook={notebook} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
