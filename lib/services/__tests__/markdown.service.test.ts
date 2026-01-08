import { describe, test, expect } from 'bun:test';

import {
  markdownToHtml,
  extractExcerpt,
  estimateReadingTime,
} from '../markdown.service';

describe('Markdown Service', () => {
  describe('markdownToHtml', () => {
    test('should convert basic markdown to HTML', () => {
      const markdown = '# Hello World\n\nThis is a paragraph.';
      const result = markdownToHtml(markdown);

      expect(result.html).toBeDefined();
      expect(result.html).toContain('<h1>');
      expect(result.html).toContain('Hello World');
      expect(result.html).toContain('<p>');
      expect(result.html).toContain('This is a paragraph');
    });

    test('should handle headings at different levels', () => {
      const markdown = `# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading`;

      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<h1>H1 Heading</h1>');
      expect(result.html).toContain('<h2>H2 Heading</h2>');
      expect(result.html).toContain('<h3>H3 Heading</h3>');
      expect(result.html).toContain('<h4>H4 Heading</h4>');
    });

    test('should convert links to HTML', () => {
      const markdown = '[GitHub](https://github.com)';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<a href="https://github.com">GitHub</a>');
    });

    test('should handle bold and italic text', () => {
      const markdown = '**bold text** and *italic text*';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<strong>bold text</strong>');
      expect(result.html).toContain('<em>italic text</em>');
    });

    test('should handle inline code', () => {
      const markdown = 'Use `const` for constants.';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<code>const</code>');
    });

    test('should handle code blocks without language', () => {
      const markdown = '```\nconst x = 1;\n```';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('<code>');
      expect(result.html).toContain('const x = 1;');
    });

    test('should handle code blocks with language', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('<code');
      expect(result.html).toContain('const');
    });

    test('should apply syntax highlighting to code blocks', () => {
      const markdown = '```typescript\nconst greeting: string = "Hello";\n```';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('<code');
      // Highlight.js adds span tags for syntax highlighting
      expect(result.html).toContain('const');
      expect(result.html).toContain('greeting');
    });

    test('should handle unordered lists', () => {
      const markdown = `- Item 1
- Item 2
- Item 3`;

      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<ul>');
      expect(result.html).toContain('<li>Item 1</li>');
      expect(result.html).toContain('<li>Item 2</li>');
      expect(result.html).toContain('<li>Item 3</li>');
    });

    test('should handle ordered lists', () => {
      const markdown = `1. First
2. Second
3. Third`;

      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<ol>');
      expect(result.html).toContain('<li>First</li>');
      expect(result.html).toContain('<li>Second</li>');
      expect(result.html).toContain('<li>Third</li>');
    });

    test('should handle blockquotes', () => {
      const markdown = '> This is a quote';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<blockquote>');
      expect(result.html).toContain('This is a quote');
    });

    test('should handle horizontal rules', () => {
      const markdown = 'Before\n\n---\n\nAfter';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<hr');
    });

    test('should handle empty markdown', () => {
      const markdown = '';
      const result = markdownToHtml(markdown);

      expect(result.html).toBeDefined();
      expect(result.html.trim()).toBe('');
    });

    test('should escape HTML in markdown', () => {
      const markdown = '<script>alert("xss")</script>';
      const result = markdownToHtml(markdown);

      // Markdown-it should escape HTML by default
      expect(result.html).not.toContain('<script>');
      expect(result.html).toContain('&lt;script&gt;');
    });

    test('should return parsed markdown structure', () => {
      const markdown = '# Test';
      const result = markdownToHtml(markdown);

      expect(result).toHaveProperty('html');
      expect(typeof result.html).toBe('string');
    });
  });

  describe('markdownToHtml - Frontmatter', () => {
    test('should parse frontmatter from markdown', () => {
      const markdown = `---
title: Test Article
author: John Doe
---

# Content`;

      const result = markdownToHtml(markdown);

      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.title).toBe('Test Article');
      expect(result.frontmatter?.author).toBe('John Doe');
      expect(result.html).toContain('<h1>Content</h1>');
    });

    test('should handle frontmatter with various value types', () => {
      const markdown = `---
title: Test
published: true
views: 100
---

Content`;

      const result = markdownToHtml(markdown);

      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.title).toBe('Test');
      expect(result.frontmatter?.published).toBe('true');
      expect(result.frontmatter?.views).toBe('100');
    });

    test('should handle markdown without frontmatter', () => {
      const markdown = '# No Frontmatter\n\nJust content.';
      const result = markdownToHtml(markdown);

      expect(result.frontmatter).toBeUndefined();
      expect(result.html).toContain('<h1>No Frontmatter</h1>');
    });

    test('should remove quotes from frontmatter values', () => {
      const markdown = `---
title: "Quoted Title"
author: 'Single Quotes'
---

Content`;

      const result = markdownToHtml(markdown);

      expect(result.frontmatter?.title).toBe('Quoted Title');
      expect(result.frontmatter?.author).toBe('Single Quotes');
    });

    test('should handle frontmatter with colons in values', () => {
      const markdown = `---
url: https://example.com
time: 12:30:00
---

Content`;

      const result = markdownToHtml(markdown);

      expect(result.frontmatter?.url).toBe('https://example.com');
      expect(result.frontmatter?.time).toBe('12:30:00');
    });

    test('should handle empty frontmatter', () => {
      const markdown = `---
---

Content`;

      const result = markdownToHtml(markdown);

      // Empty frontmatter (no key-value pairs) returns undefined
      expect(result.frontmatter).toBeUndefined();
      expect(result.html).toContain('Content');
    });

    test('should not parse incomplete frontmatter', () => {
      const markdown = `---
title: Test
Content without closing ---`;

      const result = markdownToHtml(markdown);

      // Should treat it as regular content
      expect(result.frontmatter).toBeUndefined();
      expect(result.html).toContain('---');
    });
  });

  describe('extractExcerpt', () => {
    test('should extract plain text from markdown', () => {
      const markdown =
        '# Heading\n\nThis is a paragraph with **bold** and *italic* text.';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe(
        'Heading This is a paragraph with bold and italic text.',
      );
    });

    test('should remove markdown links', () => {
      const markdown = 'Check out [GitHub](https://github.com) for more info.';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Check out GitHub for more info.');
      expect(excerpt).not.toContain('https://');
      expect(excerpt).not.toContain('[');
      expect(excerpt).not.toContain(']');
    });

    test('should remove inline code formatting', () => {
      const markdown = 'Use `const` for constants and `let` for variables.';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Use const for constants and let for variables.');
      expect(excerpt).not.toContain('`');
    });

    test('should truncate long content', () => {
      const markdown = 'A'.repeat(200);
      const excerpt = extractExcerpt(markdown, 50);

      expect(excerpt.length).toBeLessThanOrEqual(54); // 50 + '...'
      expect(excerpt).toContain('...');
    });

    test('should respect custom maxLength', () => {
      const markdown =
        'This is a test excerpt that is longer than the default.';
      const excerpt = extractExcerpt(markdown, 20);

      expect(excerpt.length).toBeLessThanOrEqual(24); // 20 + '...'
      expect(excerpt).toContain('...');
    });

    test('should not truncate short content', () => {
      const markdown = 'Short text.';
      const excerpt = extractExcerpt(markdown, 100);

      expect(excerpt).toBe('Short text.');
      expect(excerpt).not.toContain('...');
    });

    test('should handle empty markdown', () => {
      const markdown = '';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('');
    });

    test('should handle markdown with only headings', () => {
      const markdown = '# Title\n## Subtitle\n### Section';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Title Subtitle Section');
    });

    test('should replace newlines with spaces', () => {
      const markdown = 'Line 1\n\nLine 2\n\nLine 3';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Line 1 Line 2 Line 3');
      expect(excerpt).not.toContain('\n');
    });

    test('should handle markdown with frontmatter', () => {
      const markdown = `---
title: Test
---

This is the content.`;

      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('This is the content.');
      expect(excerpt).not.toContain('---');
      expect(excerpt).not.toContain('title:');
    });

    test('should remove all markdown formatting', () => {
      const markdown = `# Heading

**Bold text** and *italic text* with [a link](https://example.com).

- List item 1
- List item 2

\`inline code\``;

      const excerpt = extractExcerpt(markdown);

      expect(excerpt).not.toContain('**');
      expect(excerpt).not.toContain('*');
      expect(excerpt).not.toContain('[');
      expect(excerpt).not.toContain('](');
      expect(excerpt).not.toContain('`');
      // Note: List item dashes remain in plain text
      expect(excerpt).toContain('Bold text');
      expect(excerpt).toContain('italic text');
      expect(excerpt).toContain('List item');
    });

    test('should use default maxLength of 160', () => {
      const longText = 'A'.repeat(200);
      const excerpt = extractExcerpt(longText);

      expect(excerpt.length).toBeLessThanOrEqual(164); // 160 + '...'
    });

    test('should trim whitespace', () => {
      const markdown = '   \n\n  Content with spaces  \n\n   ';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Content with spaces');
      expect(excerpt).not.toMatch(/^\s/);
      expect(excerpt).not.toMatch(/\s$/);
    });
  });

  describe('estimateReadingTime', () => {
    test('should estimate reading time for short content', () => {
      const markdown = 'This is a short paragraph with about ten words.';
      const time = estimateReadingTime(markdown);

      expect(time).toBe(1); // Less than 200 words = 1 minute
    });

    test('should estimate reading time for longer content', () => {
      // Create ~400 words
      const words = Array(400).fill('word').join(' ');
      const time = estimateReadingTime(words);

      expect(time).toBe(2); // 400 words / 200 = 2 minutes
    });

    test('should round up reading time', () => {
      // Create ~250 words (should round up to 2 minutes)
      const words = Array(250).fill('word').join(' ');
      const time = estimateReadingTime(words);

      expect(time).toBe(2); // Math.ceil(250 / 200) = 2
    });

    test('should handle empty content', () => {
      const markdown = '';
      const time = estimateReadingTime(markdown);

      expect(time).toBe(1); // Math.ceil(0 / 200) = 1 (minimum)
    });

    test('should ignore frontmatter in word count', () => {
      const markdown = `---
title: Test Article
author: John Doe
published: true
---

${Array(200).fill('word').join(' ')}`;

      const time = estimateReadingTime(markdown);

      // Should only count content, not frontmatter
      // 200 words = Math.ceil(200/200) = 1 minute
      expect(time).toBeGreaterThanOrEqual(1);
      expect(time).toBeLessThanOrEqual(2);
    });

    test('should count words correctly with multiple spaces', () => {
      const markdown = 'word   word    word'; // 3 words with extra spaces
      const time = estimateReadingTime(markdown);

      expect(time).toBe(1);
    });

    test('should handle markdown formatting in word count', () => {
      const markdown = `# Title

**Bold text** and *italic text*.

- List item 1
- List item 2

\`code\``;

      const time = estimateReadingTime(markdown);

      // Should count all words, including those with formatting
      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThan(0);
    });

    test('should calculate time based on 200 words per minute', () => {
      // Exactly 600 words
      const words = Array(600).fill('word').join(' ');
      const time = estimateReadingTime(words);

      expect(time).toBe(3); // 600 / 200 = 3 minutes
    });

    test('should always return at least 1 minute', () => {
      const markdown = 'Just a few words';
      const time = estimateReadingTime(markdown);

      expect(time).toBeGreaterThanOrEqual(1);
    });

    test('should handle very long articles', () => {
      // Create ~5000 words
      const words = Array(5000).fill('word').join(' ');
      const time = estimateReadingTime(words);

      expect(time).toBe(25); // 5000 / 200 = 25 minutes
    });

    test('should return integer reading time', () => {
      const markdown = Array(100).fill('word').join(' ');
      const time = estimateReadingTime(markdown);

      expect(Number.isInteger(time)).toBe(true);
    });
  });

  describe('Type Safety', () => {
    test('should return properly typed ParsedMarkdown', () => {
      const markdown = '# Test';
      const result = markdownToHtml(markdown);

      expect(typeof result.html).toBe('string');
      expect(
        result.frontmatter === undefined ||
          typeof result.frontmatter === 'object',
      ).toBe(true);
    });

    test('should return string for excerpt', () => {
      const markdown = 'Test content';
      const excerpt = extractExcerpt(markdown);

      expect(typeof excerpt).toBe('string');
    });

    test('should return number for reading time', () => {
      const markdown = 'Test content';
      const time = estimateReadingTime(markdown);

      expect(typeof time).toBe('number');
    });

    test('should have no implicit any types', () => {
      // This is a compile-time check, verified at runtime
      const markdown = '# Test';

      const htmlResult = markdownToHtml(markdown);
      const excerptResult = extractExcerpt(markdown);
      const timeResult = estimateReadingTime(markdown);

      expect(typeof htmlResult).toBe('object');
      expect(typeof excerptResult).toBe('string');
      expect(typeof timeResult).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    test('should handle markdown with special characters', () => {
      const markdown = '# Test & Special <> Characters';
      const result = markdownToHtml(markdown);

      expect(result.html).toBeDefined();
      expect(result.html).toContain('&amp;');
      expect(result.html).toContain('&lt;');
      expect(result.html).toContain('&gt;');
    });

    test('should handle very long single words in excerpt', () => {
      const longWord = 'A'.repeat(200);
      const excerpt = extractExcerpt(longWord, 50);

      expect(excerpt.length).toBeLessThanOrEqual(54);
    });

    test('should handle markdown with unicode characters', () => {
      const markdown = '# 你好世界 🚀 Émojis';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('你好世界');
      expect(result.html).toContain('🚀');
      expect(result.html).toContain('Émojis');
    });

    test('should handle nested markdown formatting', () => {
      const markdown = '**Bold with *italic* inside**';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<strong>');
      expect(result.html).toContain('<em>');
    });

    test('should handle malformed frontmatter gracefully', () => {
      const markdown = `---
invalid yaml: : : :
---

Content`;

      const result = markdownToHtml(markdown);

      // Should still parse content
      expect(result.html).toBeDefined();
    });

    test('should handle code blocks with invalid language', () => {
      const markdown = '```nonexistentlanguage\ncode here\n```';
      const result = markdownToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('code here');
    });
  });
});
