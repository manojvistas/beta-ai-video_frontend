/**
 * Export utility functions for content download
 * Supports: PDF, DOCX, Markdown, Plain Text
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export type ExportFormat = 'pdf' | 'docx' | 'markdown' | 'txt'

interface ExportOptions {
  title: string
  content: string
  htmlContent?: string
}

/**
 * Convert HTML string to plain text
 */
export function htmlToPlainText(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * Export as Plain Text
 */
export async function exportAsText(options: ExportOptions): Promise<void> {
  const { title, content } = options
  const text = content

  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  )
  element.setAttribute('download', `${sanitizeFilename(title)}.txt`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * Export as Markdown
 */
export async function exportAsMarkdown(options: ExportOptions): Promise<void> {
  const { title, content } = options

  const markdown = `# ${title}\n\n${content}`

  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdown)
  )
  element.setAttribute('download', `${sanitizeFilename(title)}.md`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * Export as PDF using jsPDF
 */
export async function exportAsPDF(options: ExportOptions): Promise<void> {
  try {
    const { title, content } = options

    if (!content) {
      throw new Error('Content is required for PDF export')
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const maxWidth = pageWidth - margin * 2
    let yPosition = 20

    // Set title
    pdf.setFontSize(18)
    pdf.setFont('', 'bold')
    const titleLines = pdf.splitTextToSize(title, maxWidth) as string[]
    titleLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition)
      yPosition += 8
    })

    yPosition += 5

    // Split content by lines and add to PDF
    pdf.setFontSize(11)
    pdf.setFont('', 'normal')
    const contentLines = content.split('\n')

    for (const line of contentLines) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }

      if (line.trim()) {
        const wrappedText = pdf.splitTextToSize(line, maxWidth) as string[]
        wrappedText.forEach((wrappedLine: string) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage()
            yPosition = margin
          }
          pdf.text(wrappedLine, margin, yPosition)
          yPosition += 6
        })
      } else {
        yPosition += 4 // Add spacing for empty lines
      }
    }

    pdf.save(`${sanitizeFilename(title)}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error('Failed to export as PDF')
  }
}

/**
 * Export as DOCX (Word document)
 */
export async function exportAsDocx(options: ExportOptions): Promise<void> {
  try {
    // Dynamic import to reduce bundle size
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')

    const { title, content } = options

    // Parse markdown-like content into docx paragraphs
    const paragraphs = content.split('\n').map((line) => {
      if (line.startsWith('# ')) {
        return new Paragraph({
          text: line.replace('# ', ''),
          style: 'Heading1',
          spacing: { line: 360, before: 240, after: 120 },
        })
      }
      if (line.startsWith('## ')) {
        return new Paragraph({
          text: line.replace('## ', ''),
          style: 'Heading2',
          spacing: { line: 360, before: 200, after: 100 },
        })
      }
      if (line.startsWith('- ')) {
        return new Paragraph({
          text: line.replace('- ', ''),
          style: 'ListBullet',
        })
      }
      return new Paragraph({
        text: line || ' ',
        spacing: { line: 360 },
      })
    })

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 240 },
            }),
            ...paragraphs,
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizeFilename(title)}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('DOCX export failed:', error)
    throw new Error('Failed to export as DOCX')
  }
}

/**
 * Main export function - handles all formats
 */
export async function exportContent(
  format: ExportFormat,
  options: ExportOptions
): Promise<void> {
  try {
    switch (format) {
      case 'pdf':
        await exportAsPDF(options)
        break
      case 'docx':
        await exportAsDocx(options)
        break
      case 'markdown':
        await exportAsMarkdown(options)
        break
      case 'txt':
        await exportAsText(options)
        break
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  } catch (error) {
    console.error(`Export failed for format: ${format}`, error)
    throw error
  }
}

/**
 * Sanitize filename to remove invalid characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9\s-_]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 255)
}
