/**
 * ContentDisplay Component
 * Applies text size and font preferences to markdown content
 */

'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useContentPreferences, FONT_FAMILIES } from '@/lib/hooks/use-content-preferences'

interface ContentDisplayProps {
  content: string
  className?: string
}

export function ContentDisplay({ content, className = '' }: ContentDisplayProps) {
  const { preferences } = useContentPreferences()

  const fontSize = (preferences.textSize / 100) * 16
  const fontFamily = FONT_FAMILIES[preferences.fontFamily] || FONT_FAMILIES.inter

  const containerStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
    lineHeight: 1.6,
  }

  return (
    <div
      className={`prose prose-invert max-w-none ${className}`}
      style={containerStyle}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-3xl font-bold mt-6 mb-4" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-2xl font-bold mt-5 mb-3" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-xl font-bold mt-4 mb-2" />
          ),
          p: ({ node, ...props }) => <p {...props} className="my-4 leading-relaxed" />,
          ul: ({ node, ...props }) => (
            <ul
              {...props}
              className="list-disc list-inside my-4 space-y-2 pl-4"
            />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-inside my-4 space-y-2 pl-4" />
          ),
          li: ({ node, ...props }) => <li {...props} className="my-2" />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
            />
          ),
          code: ({ node, inline, className, ...props }: any) =>
            inline ? (
              <code
                {...props}
                className="bg-muted px-2 py-1 rounded text-sm font-mono"
              />
            ) : (
              <code
                {...props}
                className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-4"
              />
            ),
          table: ({ node, ...props }) => (
            <table
              {...props}
              className="border-collapse border border-border my-4 w-full"
            />
          ),
          tr: ({ node, ...props }) => (
            <tr {...props} className="border border-border" />
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border border-border bg-muted px-4 py-2 text-left font-bold"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-border px-4 py-2" />
          ),
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="max-w-full h-auto rounded-lg my-4"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
