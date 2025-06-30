import { processMarkdown } from '../services/markdown'

describe('Markdown Processing', () => {
  describe('processMarkdown', () => {
    it('should convert simple markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is a **bold** text.'
      const result = await processMarkdown(markdown)

      expect(result).toContain('<h1>Hello World</h1>')
      expect(result).toContain('<strong>bold</strong>')
      expect(result).toContain('<p>This is a')
    })

    it('should handle code blocks', async () => {
      const markdown = '```javascript\nconst x = 1;\n```'
      const result = await processMarkdown(markdown)

      expect(result).toContain('<pre>')
      expect(result).toContain('class="language-javascript"')
      expect(result).toContain('const x = 1;')
    })

    it('should handle GitHub Flavored Markdown features', async () => {
      const markdown =
        '- [x] Completed task\n- [ ] Pending task\n\nLine break\nTest'
      const result = await processMarkdown(markdown)

      expect(result).toContain('<ul>')
      expect(result).toContain('<li>')
      expect(result).toContain('<br>')
    })
  })
})
