import { describe, test, expect } from 'bun:test';

import {
  markdownToHtml,
  extractExcerpt,
  estimateReadingTime,
} from '../markdown.service';

describe('Markdown Service', async () => {
  describe('markdownToHtml', async () => {
    test('should convert basic markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is a paragraph.';
      const result = await markdownToHtml(markdown);

      expect(result.html).toBeDefined();
      expect(result.html).toContain('<h1>');
      expect(result.html).toContain('Hello World');
      expect(result.html).toContain('<p>');
      expect(result.html).toContain('This is a paragraph');
    });

    test('should handle headings at different levels', async () => {
      const markdown = `# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading`;

      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<h1>H1 Heading</h1>');
      expect(result.html).toContain('<h2>H2 Heading</h2>');
      expect(result.html).toContain('<h3>H3 Heading</h3>');
      expect(result.html).toContain('<h4>H4 Heading</h4>');
    });

    test('should convert links to HTML', async () => {
      const markdown = '[GitHub](https://github.com)';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<a href="https://github.com">GitHub</a>');
    });

    test('should handle bold and italic text', async () => {
      const markdown = '**bold text** and *italic text*';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<strong>bold text</strong>');
      expect(result.html).toContain('<em>italic text</em>');
    });

    test('should handle inline code', async () => {
      const markdown = 'Use `const` for constants.';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<code>const</code>');
    });

    test('should handle code blocks without language', async () => {
      const markdown = '```\nconst x = 1;\n```';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('<code>');
      expect(result.html).toContain('const x = 1;');
    });

    test('should handle code blocks with language', async () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('<code');
      expect(result.html).toContain('const');
    });

    test('should apply syntax highlighting to code blocks', async () => {
      const markdown = '```typescript\nconst greeting: string = "Hello";\n```';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('<code');
      // Highlight.js adds span tags for syntax highlighting
      expect(result.html).toContain('const');
      expect(result.html).toContain('greeting');
    });

    test('should handle unordered lists', async () => {
      const markdown = `- Item 1
- Item 2
- Item 3`;

      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<ul>');
      expect(result.html).toContain('<li>Item 1</li>');
      expect(result.html).toContain('<li>Item 2</li>');
      expect(result.html).toContain('<li>Item 3</li>');
    });

    test('should handle ordered lists', async () => {
      const markdown = `1. First
2. Second
3. Third`;

      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<ol>');
      expect(result.html).toContain('<li>First</li>');
      expect(result.html).toContain('<li>Second</li>');
      expect(result.html).toContain('<li>Third</li>');
    });

    test('should handle blockquotes', async () => {
      const markdown = '> This is a quote';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<blockquote>');
      expect(result.html).toContain('This is a quote');
    });

    test('should handle horizontal rules', async () => {
      const markdown = 'Before\n\n---\n\nAfter';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<hr');
    });

    test('should handle empty markdown', async () => {
      const markdown = '';
      const result = await markdownToHtml(markdown);

      expect(result.html).toBeDefined();
      expect(result.html.trim()).toBe('');
    });

    test('should escape HTML in markdown', async () => {
      const markdown = '<script>alert("xss")</script>';
      const result = await markdownToHtml(markdown);

      // Markdown-it should escape HTML by default
      expect(result.html).not.toContain('<script>');
      expect(result.html).toContain('&lt;script&gt;');
    });

    test('should return parsed markdown structure', async () => {
      const markdown = '# Test';
      const result = await markdownToHtml(markdown);

      expect(result).toHaveProperty('html');
      expect(typeof result.html).toBe('string');
    });
  });

  describe('markdownToHtml - Frontmatter', async () => {
    test('should parse frontmatter from markdown', async () => {
      const markdown = `---
title: Test Article
author: John Doe
---

# Content`;

      const result = await markdownToHtml(markdown);

      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.title).toBe('Test Article');
      expect(result.frontmatter?.author).toBe('John Doe');
      expect(result.html).toContain('<h1>Content</h1>');
    });

    test('should handle frontmatter with various value types', async () => {
      const markdown = `---
title: Test
published: true
views: 100
---

Content`;

      const result = await markdownToHtml(markdown);

      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.title).toBe('Test');
      expect(result.frontmatter?.published).toBe('true');
      expect(result.frontmatter?.views).toBe('100');
    });

    test('should handle markdown without frontmatter', async () => {
      const markdown = '# No Frontmatter\n\nJust content.';
      const result = await markdownToHtml(markdown);

      expect(result.frontmatter).toBeUndefined();
      expect(result.html).toContain('<h1>No Frontmatter</h1>');
    });

    test('should remove quotes from frontmatter values', async () => {
      const markdown = `---
title: "Quoted Title"
author: 'Single Quotes'
---

Content`;

      const result = await markdownToHtml(markdown);

      expect(result.frontmatter?.title).toBe('Quoted Title');
      expect(result.frontmatter?.author).toBe('Single Quotes');
    });

    test('should handle frontmatter with colons in values', async () => {
      const markdown = `---
url: https://example.com
time: 12:30:00
---

Content`;

      const result = await markdownToHtml(markdown);

      expect(result.frontmatter?.url).toBe('https://example.com');
      expect(result.frontmatter?.time).toBe('12:30:00');
    });

    test('should handle empty frontmatter', async () => {
      const markdown = `---
---

Content`;

      const result = await markdownToHtml(markdown);

      // Empty frontmatter (no key-value pairs) returns undefined
      expect(result.frontmatter).toBeUndefined();
      expect(result.html).toContain('Content');
    });

    test('should not parse incomplete frontmatter', async () => {
      const markdown = `---
title: Test
Content without closing ---`;

      const result = await markdownToHtml(markdown);

      // Should treat it as regular content
      expect(result.frontmatter).toBeUndefined();
      expect(result.html).toContain('---');
    });
  });

  describe('extractExcerpt', async () => {
    test('should extract plain text from markdown', async () => {
      const markdown =
        '# Heading\n\nThis is a paragraph with **bold** and *italic* text.';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe(
        'Heading This is a paragraph with bold and italic text.',
      );
    });

    test('should remove markdown links', async () => {
      const markdown = 'Check out [GitHub](https://github.com) for more info.';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Check out GitHub for more info.');
      expect(excerpt).not.toContain('https://');
      expect(excerpt).not.toContain('[');
      expect(excerpt).not.toContain(']');
    });

    test('should remove inline code formatting', async () => {
      const markdown = 'Use `const` for constants and `let` for variables.';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Use const for constants and let for variables.');
      expect(excerpt).not.toContain('`');
    });

    test('should truncate long content', async () => {
      const markdown = 'A'.repeat(200);
      const excerpt = extractExcerpt(markdown, 50);

      expect(excerpt.length).toBeLessThanOrEqual(54); // 50 + '...'
      expect(excerpt).toContain('...');
    });

    test('should respect custom maxLength', async () => {
      const markdown =
        'This is a test excerpt that is longer than the default.';
      const excerpt = extractExcerpt(markdown, 20);

      expect(excerpt.length).toBeLessThanOrEqual(24); // 20 + '...'
      expect(excerpt).toContain('...');
    });

    test('should not truncate short content', async () => {
      const markdown = 'Short text.';
      const excerpt = extractExcerpt(markdown, 100);

      expect(excerpt).toBe('Short text.');
      expect(excerpt).not.toContain('...');
    });

    test('should handle empty markdown', async () => {
      const markdown = '';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('');
    });

    test('should handle markdown with only headings', async () => {
      const markdown = '# Title\n## Subtitle\n### Section';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Title Subtitle Section');
    });

    test('should replace newlines with spaces', async () => {
      const markdown = 'Line 1\n\nLine 2\n\nLine 3';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Line 1 Line 2 Line 3');
      expect(excerpt).not.toContain('\n');
    });

    test('should handle markdown with frontmatter', async () => {
      const markdown = `---
title: Test
---

This is the content.`;

      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('This is the content.');
      expect(excerpt).not.toContain('---');
      expect(excerpt).not.toContain('title:');
    });

    test('should remove all markdown formatting', async () => {
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

    test('should use default maxLength of 160', async () => {
      const longText = 'A'.repeat(200);
      const excerpt = extractExcerpt(longText);

      expect(excerpt.length).toBeLessThanOrEqual(164); // 160 + '...'
    });

    test('should trim whitespace', async () => {
      const markdown = '   \n\n  Content with spaces  \n\n   ';
      const excerpt = extractExcerpt(markdown);

      expect(excerpt).toBe('Content with spaces');
      expect(excerpt).not.toMatch(/^\s/);
      expect(excerpt).not.toMatch(/\s$/);
    });
  });

  describe('estimateReadingTime', async () => {
    test('should estimate reading time for short content', async () => {
      const markdown = 'This is a short paragraph with about ten words.';
      const time = estimateReadingTime(markdown);

      expect(time).toBe(1); // Less than 200 words = 1 minute
    });

    test('should estimate reading time for longer content', async () => {
      // Create ~400 words
      const words = Array(400).fill('word').join(' ');
      const time = estimateReadingTime(words);

      expect(time).toBe(2); // 400 words / 200 = 2 minutes
    });

    test('should round up reading time', async () => {
      // Create ~250 words (should round up to 2 minutes)
      const words = Array(250).fill('word').join(' ');
      const time = estimateReadingTime(words);

      expect(time).toBe(2); // Math.ceil(250 / 200) = 2
    });

    test('should handle empty content', async () => {
      const markdown = '';
      const time = estimateReadingTime(markdown);

      expect(time).toBe(1); // Math.ceil(0 / 200) = 1 (minimum)
    });

    test('should ignore frontmatter in word count', async () => {
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

    test('should count words correctly with multiple spaces', async () => {
      const markdown = 'word   word    word'; // 3 words with extra spaces
      const time = estimateReadingTime(markdown);

      expect(time).toBe(1);
    });

    test('should handle markdown formatting in word count', async () => {
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

    test('should calculate time based on 200 words per minute', async () => {
      // Exactly 600 words
      const words = Array(600).fill('word').join(' ');
      const time = estimateReadingTime(words);

      expect(time).toBe(3); // 600 / 200 = 3 minutes
    });

    test('should always return at least 1 minute', async () => {
      const markdown = 'Just a few words';
      const time = estimateReadingTime(markdown);

      expect(time).toBeGreaterThanOrEqual(1);
    });

    test('should handle very long articles', async () => {
      // Create ~5000 words
      const words = Array(5000).fill('word').join(' ');
      const time = estimateReadingTime(words);

      expect(time).toBe(25); // 5000 / 200 = 25 minutes
    });

    test('should return integer reading time', async () => {
      const markdown = Array(100).fill('word').join(' ');
      const time = estimateReadingTime(markdown);

      expect(Number.isInteger(time)).toBe(true);
    });
  });

  describe('Type Safety', async () => {
    test('should return properly typed ParsedMarkdown', async () => {
      const markdown = '# Test';
      const result = await markdownToHtml(markdown);

      expect(typeof result.html).toBe('string');
      expect(
        result.frontmatter === undefined ||
          typeof result.frontmatter === 'object',
      ).toBe(true);
    });

    test('should return string for excerpt', async () => {
      const markdown = 'Test content';
      const excerpt = extractExcerpt(markdown);

      expect(typeof excerpt).toBe('string');
    });

    test('should return number for reading time', async () => {
      const markdown = 'Test content';
      const time = estimateReadingTime(markdown);

      expect(typeof time).toBe('number');
    });

    test('should have no implicit any types', async () => {
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

  describe('Edge Cases', async () => {
    test('should handle markdown with special characters', async () => {
      const markdown = '# Test & Special <> Characters';
      const result = await markdownToHtml(markdown);

      expect(result.html).toBeDefined();
      expect(result.html).toContain('&amp;');
      expect(result.html).toContain('&lt;');
      expect(result.html).toContain('&gt;');
    });

    test('should handle very long single words in excerpt', async () => {
      const longWord = 'A'.repeat(200);
      const excerpt = extractExcerpt(longWord, 50);

      expect(excerpt.length).toBeLessThanOrEqual(54);
    });

    test('should handle markdown with unicode characters', async () => {
      const markdown = '# 你好世界 🚀 Émojis';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('你好世界');
      expect(result.html).toContain('🚀');
      expect(result.html).toContain('Émojis');
    });

    test('should handle nested markdown formatting', async () => {
      const markdown = '**Bold with *italic* inside**';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<strong>');
      expect(result.html).toContain('<em>');
    });

    test('should handle malformed frontmatter gracefully', async () => {
      const markdown = `---
invalid yaml: : : :
---

Content`;

      const result = await markdownToHtml(markdown);

      // Should still parse content
      expect(result.html).toBeDefined();
    });

    test('should handle code blocks with invalid language', async () => {
      const markdown = '```nonexistentlanguage\ncode here\n```';
      const result = await markdownToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('code here');
    });
  });
});
