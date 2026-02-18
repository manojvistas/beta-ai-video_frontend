/**
 * ContentToolbar Component
 * Provides export, share, text size adjustment, and font selection
 */

'use client'

import { useCallback, useState, useMemo } from 'react'
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
  X,
  Video,
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
  const [showShareModal, setShowShareModal] = useState(false)
  const [fontSearch, setFontSearch] = useState('')
  const { preferences, updateTextSize, updateFontFamily } = useContentPreferences()

  // Filter fonts based on search
  const filteredFonts = useMemo(() => {
    if (!fontSearch.trim()) {
      return (Object.keys(FONT_DISPLAY_NAMES) as FontFamily[])
    }
    const searchLower = fontSearch.toLowerCase()
    return (Object.keys(FONT_DISPLAY_NAMES) as FontFamily[]).filter(
      (font) =>
        FONT_DISPLAY_NAMES[font].toLowerCase().includes(searchLower) ||
        font.toLowerCase().includes(searchLower)
    )
  }, [fontSearch])

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

  // Handle native share with Web Share API or fallback to modal
  const handleShare = useCallback(async () => {
    try {
      const linkToShare = sourceUrl || window.location.href
      
      // Check if Web Share API is supported
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Content',
            text: 'Check out this content',
            url: linkToShare,
          })
          toast.success('Content shared!')
        } catch (error: any) {
          // User cancelled the share dialog
          if (error.name !== 'AbortError') {
            throw error
          }
        }
      } else {
        // Fallback to custom modal if Web Share API not supported
        setShowShareModal(true)
      }
    } catch (error) {
      console.error('Share failed:', error)
      toast.error('Failed to share content')
    }
  }, [title, sourceUrl])

  // Handle copy to clipboard (for modal fallback)
  const handleCopyLink = useCallback(async () => {
    try {
      const linkToCopy = sourceUrl || window.location.href
      await navigator.clipboard.writeText(linkToCopy)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
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
      setFontSearch('')
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
            
            {/* Always show Video Download option if a URL exists, let the user try */}
            {sourceUrl && (
                <>
                <DropdownMenuSeparator />
                 <DropdownMenuItem
                  onClick={async () => {
                    if (sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be')) {
                        // Scroll to video section if it exists on the page
                        const videoElement = document.querySelector('iframe[title="YouTube video player"]');
                        if (videoElement) {
                            videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            toast.success('Scrolled to video player');
                        } else {
                            window.open(sourceUrl, '_blank');
                        }
                        return;
                    }

                     const a = document.createElement('a')
                    a.href = sourceUrl
                    a.download = sourceUrl.split('/').pop() || 'video.mp4'
                    a.target = '_blank'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    toast.success('Downloading video...')
                  }}
                  className="gap-2 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                >
                  <Video className="h-4 w-4" />
                  {sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be') ? 'Open Video' : 'Download Video File'}
                </DropdownMenuItem>
                </>
            )}

          </DropdownMenuContent>
        </DropdownMenu>

        {/* Share Button - Web Share API with Fallback */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {/* @ts-ignore */}
            {typeof navigator !== 'undefined' && navigator.share ? 'Share via apps' : 'Copy share link'}
          </TooltipContent>
        </Tooltip>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Share This Content</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Link to share:</p>
                  <p className="text-sm break-all font-mono">
                    {sourceUrl || window.location.href}
                  </p>
                </div>
                <Button
                  onClick={handleCopyLink}
                  className="w-full gap-2"
                  variant="default"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowShareModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

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

        {/* Font Selector with Search */}
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
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 pb-0">
              <input
                type="text"
                placeholder="Search fonts..."
                value={fontSearch}
                onChange={(e) => setFontSearch(e.target.value)}
                className="w-full px-2 py-1 text-sm rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {filteredFonts.length > 0 ? (
                filteredFonts.map((font) => (
                  <DropdownMenuItem
                    key={font}
                    onClick={() => handleFontChange(font)}
                    className={`cursor-pointer ${
                      preferences.fontFamily === font ? 'bg-accent font-semibold' : ''
                    }`}
                  >
                    <span style={{ fontFamily: FONT_DISPLAY_NAMES[font] }}>
                      {FONT_DISPLAY_NAMES[font]}
                    </span>
                    {preferences.fontFamily === font && (
                      <CheckCircle className="h-4 w-4 ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No fonts found</DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  )
}
