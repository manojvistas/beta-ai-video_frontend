'use client'

import { AppShell } from '@/components/layout/AppShell'
import { SettingsForm } from './components/SettingsForm'
import { useSettings } from '@/lib/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { RefreshCw, ArrowLeft } from 'lucide-react'
import { useTranslation } from '@/lib/hooks/use-translation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { refetch } = useSettings()
  const router = useRouter()

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-4xl">
            <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="mb-6"
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

            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold">{t.navigation.settings}</h1>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <SettingsForm />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
