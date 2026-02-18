'use client'

import { AppShell } from '@/components/layout/AppShell'
import { RebuildEmbeddings } from './components/RebuildEmbeddings'
import { SystemInfo } from './components/SystemInfo'
import { useTranslation } from '@/lib/hooks/use-translation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdvancedPage() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
           <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="mb-6 max-w-4xl mx-auto"
            >
               <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 pl-0 text-muted-foreground hover:text-foreground transition-colors group"
                  onClick={() => router.push('/')}
               >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Dashboard
               </Button>
            </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{t.advanced.title}</h1>
              <p className="text-muted-foreground mt-2">
                {t.advanced.desc}
              </p>
            </div>

            <SystemInfo />
            <RebuildEmbeddings />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
