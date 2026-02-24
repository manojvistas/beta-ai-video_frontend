'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { useTranslation } from '@/lib/hooks/use-translation'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  iconOnly?: boolean
}

export function LanguageToggle({ iconOnly = false }: LanguageToggleProps) {
  const { language, setLanguage, t } = useTranslation()
  
  // Keep the actual language code for proper comparison
  const currentLang = language || 'en-US'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={iconOnly ? "ghost" : "outline"} 
          size={iconOnly ? "icon" : "default"} 
          className={iconOnly ? "h-9 w-full sidebar-menu-item" : "w-full justify-start gap-2 sidebar-menu-item"}
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          {!iconOnly && <span>{t.common.language}</span>}
          <span className="sr-only">{t.navigation.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        side="right"
        sideOffset={12}
        className="z-[9999] min-w-[180px] bg-popover border-border shadow-xl p-1.5"
      >
        <DropdownMenuItem 
          onClick={() => setLanguage('en-US')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground",
            (currentLang === 'en-US' || currentLang.startsWith('en')) ? 'bg-accent/80 text-accent-foreground' : 'hover:bg-accent/50'
          )}
        >
          <span className="text-sm font-medium">{t.common.english}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('zh-CN')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground",
            (currentLang === 'zh-CN' || currentLang.startsWith('zh-Hans') || currentLang === 'zh') ? 'bg-accent/80 text-accent-foreground' : 'hover:bg-accent/50'
          )}
        >
          <span className="text-sm font-medium">{t.common.chinese}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('zh-TW')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground",
            (currentLang === 'zh-TW' || currentLang.startsWith('zh-Hant')) ? 'bg-accent/80 text-accent-foreground' : 'hover:bg-accent/50'
          )}
        >
          <span className="text-sm font-medium">{t.common.traditionalChinese}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('pt-BR')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground",
            (currentLang === 'pt-BR' || currentLang.startsWith('pt')) ? 'bg-accent/80 text-accent-foreground' : 'hover:bg-accent/50'
          )}
        >
          <span className="text-sm font-medium">{t.common.portuguese}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('ja-JP')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground",
            (currentLang === 'ja-JP' || currentLang.startsWith('ja')) ? 'bg-accent/80 text-accent-foreground' : 'hover:bg-accent/50'
          )}
        >
          <span className="text-sm font-medium">{t.common.japanese}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
