import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: true, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable some language-neutral replacement + quotes beautification
})

/**
 * Process markdown content and return HTML
 */
export const processMarkdown = async (markdown: string): Promise<string> => {
  try {
    const html = md.render(markdown)
    return html
  } catch (error) {
    console.error('Error processing markdown:', error)
    throw new Error('Failed to process markdown content')
  }
}
