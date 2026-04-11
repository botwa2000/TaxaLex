/**
 * Generates a .docx file from the appeal letter text and triggers a browser download.
 * Uses the `docx` package with dynamic import to avoid adding it to the initial bundle.
 *
 * The letter text may contain markdown-style headings (## Section) and numbered lists.
 * These are converted to proper Word heading styles and list items.
 */
export async function downloadAsDocx(text: string, filename: string): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    convertInchesToTwip,
  } = await import('docx')

  const lines = text.split('\n')
  const children: InstanceType<typeof Paragraph>[] = []

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (line.startsWith('## ')) {
      // Section heading
      children.push(
        new Paragraph({
          text: line.replace(/^## /, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      )
    } else if (line.startsWith('# ')) {
      // Document title
      children.push(
        new Paragraph({
          text: line.replace(/^# /, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 0, after: 240 },
        })
      )
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered list item
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line })],
          indent: { left: convertInchesToTwip(0.25) },
          spacing: { after: 60 },
        })
      )
    } else if (line.trim() === '') {
      // Empty line → paragraph break
      children.push(new Paragraph({ text: '', spacing: { after: 80 } }))
    } else {
      // Normal paragraph text
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line })],
          spacing: { after: 80 },
        })
      )
    }
  }

  const doc = new Document({
    creator: 'TaxAlex',
    description: 'Widerspruch / Einspruch',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.1),
              bottom: convertInchesToTwip(1.1),
              left: convertInchesToTwip(1.2),
              right: convertInchesToTwip(1.0),
            },
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 24, // 12pt
          },
          paragraph: {
            alignment: AlignmentType.LEFT,
            spacing: { line: 276 }, // 1.15 line spacing
          },
        },
      },
    },
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.docx') ? filename : `${filename}.docx`
  anchor.click()
  URL.revokeObjectURL(url)
}
