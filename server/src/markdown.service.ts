import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  /**
   * Enable HTML tags in source
   */
  html: true,
  /**
   * Use '/' to close single tags (<br />)
   */
  xhtmlOut: false,
  /**
   * Convert '\n' in paragraphs into <br>
   */
  breaks: true,
  /**
   * Auto-convert URL-like text to links
   */
  linkify: true,
  /**
   * Enable some language-neutral replacement + quotes beautification
   */
  typographer: true,
});

export const processMarkdown = async (markdown: string): Promise<string> => {
  try {
    return md.render(markdown);
  } catch (error) {
    console.error('Error processing markdown:', error);

    throw new Error('Failed to process markdown content');
  }
};
