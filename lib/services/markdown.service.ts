import MarkdownIt from 'markdown-it';
import type { HLJSApi } from 'highlight.js';

// Lazy-load highlight.js to optimize performance
let hljs: HLJSApi | null = null;

const getHighlighter = async (): Promise<HLJSApi> => {
  if (!hljs) {
    const hljsModule = await import('highlight.js');
    hljs = hljsModule.default;
  }

  return hljs;
};

let md: MarkdownIt | null = null;

const getMarkdownParser = async (): Promise<MarkdownIt> => {
  if (md) {
    return md;
  }

  const highlighter = await getHighlighter();

  md = new MarkdownIt({
    highlight: (code: string, language: string) => {
      if (language && highlighter.getLanguage(language)) {
        try {
          return highlighter.highlight(code, { language, ignoreIllegals: true })
            .value;
        } catch (err) {
          console.error('Highlight.js error:', err);
        }
      }

      return new MarkdownIt().utils.escapeHtml(code);
    },
  });

  return md;
};

interface FrontmatterData {
  [key: string]: string | number | boolean | null | undefined;
}

interface ParsedMarkdown {
  html: string;
  frontmatter?: FrontmatterData;
}

/**
 * Parse YAML-style frontmatter from markdown content
 * Frontmatter should be at the start of the file, enclosed by ---
 */
const parseFrontmatter = (
  content: string,
): {
  frontmatter?: FrontmatterData;
  content: string;
} => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { content };
  }

  const frontmatterString = match[1];
  const bodyContent = match[2];

  // Simple YAML parser for common frontmatter fields
  const frontmatter: FrontmatterData = {};
  const lines = frontmatterString.split('\n');

  for (const line of lines) {
    const [key, ...rest] = line.split(':');

    if (key && rest.length > 0) {
      const value = rest.join(':').trim();

      // Remove quotes if present
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
    }
  }

  return { frontmatter, content: bodyContent };
};

/**
 * Convert markdown content to HTML with syntax highlighting
 */
export const markdownToHtml = async (
  content: string,
): Promise<ParsedMarkdown> => {
  const parser = await getMarkdownParser();
  const { frontmatter, content: bodyContent } = parseFrontmatter(content);
  const html = parser.render(bodyContent);

  return {
    html,
    frontmatter,
  };
};

/**
 * Extract text excerpt from markdown content (first paragraph or specified length)
 */
export const extractExcerpt = (
  content: string,
  maxLength: number = 160,
): string => {
  const { content: bodyContent } = parseFrontmatter(content);

  // Remove markdown syntax and get plain text
  const plainText = bodyContent
    .replace(/^#+\s+/gm, '') // Remove headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italics
    .replace(/`([^`]+)`/g, '$1') // Remove code
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  // Truncate to maxLength and add ellipsis if needed
  if (plainText.length > maxLength) {
    return plainText.substring(0, maxLength).trim() + '...';
  }

  return plainText;
};

/**
 * Get reading time estimate (based on 200 words per minute)
 */
export const estimateReadingTime = (content: string): number => {
  const { content: bodyContent } = parseFrontmatter(content);
  const wordCount = bodyContent.split(/\s+/).length;

  return Math.ceil(wordCount / 200);
};
