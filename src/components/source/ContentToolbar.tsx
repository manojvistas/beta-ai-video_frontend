/**
 * ContentToolbar Component
 * Provides export, share, text size adjustment, and font selection
 */

'use client'

import { useCallback, useState } from 'react'
import {
  Download,
  Share2,
  Type,
  Palette,
  Copy,
  CheckCircle,
  Loader2,
  ChevronDown,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { exportContent, ExportFormat } from '@/lib/utils/export-utils'
import {
  useContentPreferences,
  FONT_DISPLAY_NAMES,
  FontFamily,
} from '@/lib/hooks/use-content-preferences'

interface ContentToolbarProps {
  title: string
  content: string
  htmlContent?: string
  sourceUrl?: string
  onTextSizeChange?: (size: number) => void
  onFontChange?: (font: FontFamily) => void
}

export function ContentToolbar({
  title,
  content,
  htmlContent,
  sourceUrl,
  onTextSizeChange,
  onFontChange,
}: ContentToolbarProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const { preferences, updateTextSize, updateFontFamily } = useContentPreferences()

  // Handle export
  const handleExport = useCallback(
    async (format: ExportFormat) => {
      try {
        setIsExporting(true)
        await exportContent(format, {
          title,
          content,
          htmlContent,
        })
        toast.success(`Exported as ${format.toUpperCase()}`)
      } catch (error) {
        console.error('Export failed:', error)
        toast.error(`Failed to export as ${format.toUpperCase()}`)
      } finally {
        setIsExporting(false)
      }
    },
    [title, content, htmlContent]
  )

  // Handle copy to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      if (sourceUrl) {
        await navigator.clipboard.writeText(sourceUrl)
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy link')
    }
  }, [sourceUrl])

  // Handle text size increase
  const handleIncreaseTextSize = useCallback(() => {
    const newSize = Math.min(200, preferences.textSize + 10)
    updateTextSize(newSize)
    onTextSizeChange?.(newSize)
  }, [preferences.textSize, updateTextSize, onTextSizeChange])

  // Handle text size decrease
  const handleDecreaseTextSize = useCallback(() => {
    const newSize = Math.max(75, preferences.textSize - 10)
    updateTextSize(newSize)
    onTextSizeChange?.(newSize)
  }, [preferences.textSize, updateTextSize, onTextSizeChange])

  // Handle font change
  const handleFontChange = useCallback(
    (font: FontFamily) => {
      updateFontFamily(font)
      onFontChange?.(font)
    },
    [updateFontFamily, onFontChange]
  )

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Export Button */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isExporting}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Download content in multiple formats</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export as</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              PDF Document
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport('docx')}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Word Document (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport('markdown')}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport('txt')}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Plain Text (.txt)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Share Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy shareable link to clipboard</TooltipContent>
        </Tooltip>

        {/* Text Size Controls */}
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-input">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecreaseTextSize}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrease text size</TooltipContent>
          </Tooltip>

          <span className="text-xs text-muted-foreground min-w-[2.5rem] text-center">
            {preferences.textSize}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleIncreaseTextSize}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Increase text size</TooltipContent>
          </Tooltip>
        </div>

        {/* Font Selector */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Font
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Change font style</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Font Style</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(FONT_DISPLAY_NAMES) as FontFamily[]).map((font) => (
              <DropdownMenuItem
                key={font}
                onClick={() => handleFontChange(font)}
                className={
                  preferences.fontFamily === font ? 'bg-accent font-semibold' : ''
                }
              >
                <span style={{ fontFamily: FONT_DISPLAY_NAMES[font] }}>
                  {FONT_DISPLAY_NAMES[font]}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  )
}
