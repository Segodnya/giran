import { NextResponse } from 'next/server';

import { getArticles } from '@/lib/services/article.service';

/**
 * GET /api/articles
 * Returns a list of all articles
 */
export const GET = async () => {
  try {
    const articles = await getArticles();

    return NextResponse.json(
      {
        success: true,
        data: articles,
        count: articles.length,
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
    console.error('Error fetching articles:', err);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
      },
      { status: 500 },
    );
  }
};

// Enable ISR with 60-second revalidation interval
export const revalidate = 60;
