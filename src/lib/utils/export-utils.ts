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
    const { title, htmlContent } = options

    if (!htmlContent) {
      throw new Error('HTML content is required for PDF export')
    }

    // Create a temporary container for rendering
    const container = document.createElement('div')
    container.innerHTML = htmlContent
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.style.padding = '20px'
    container.style.fontFamily = 'Arial, sans-serif'
    container.style.lineHeight = '1.6'
    container.style.color = '#000'
    container.style.backgroundColor = '#fff'
    document.body.appendChild(container)

    // Render HTML to canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    })

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Add title to PDF
    pdf.setFontSize(16)
    pdf.text(title, 10, 15)
    position = 30

    // Add pages
    while (heightLeft > 0) {
      pdf.addImage(imgData, 'PNG', 0, position - imgHeight, imgWidth, imgHeight)
      heightLeft -= 297 // A4 height in mm
      position += 297
      if (heightLeft > 0) {
        pdf.addPage()
      }
    }

    pdf.save(`${sanitizeFilename(title)}.pdf`)

    // Clean up
    document.body.removeChild(container)
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
