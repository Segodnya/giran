import { NextRequest, NextResponse } from 'next/server';

import { getArticle } from '@/lib/services/article.service';
import { markdownToHtml } from '@/lib/services/markdown.service';

/**
 * GET /api/articles/[id]
 * Returns a single article with HTML-rendered content
 */
export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article ID is required',
        },
        { status: 400 },
      );
    }

    const article = await getArticle(id);

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: `Article with ID '${id}' not found`,
        },
        { status: 404 },
      );
    }

    // Convert markdown content to HTML
    const { html, frontmatter } = await markdownToHtml(article.content);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...article,
          html,
          frontmatter,
        },
      },
      {
        status: 200,
        headers: {
          // Enable ISR with 60-second revalidation
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (err) {
    console.error('Error fetching article:', err);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch article',
      },
      { status: 500 },
    );
  }
};

// Enable ISR with 60-second revalidation interval
export const revalidate = 60;
