import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { eventEmitter, EVENTS } from '@/lib/events'

// GET /api/articles - Fetch all non-expired articles
export async function GET() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: {
        expiresAt: {
          gte: new Date() // Only get articles that haven't expired
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// POST /api/articles - Create a new article
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, content, author, category, imageURL, sourceURL } = body

    // Validate required fields
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      )
    }

    // Calculate expiration date (7 days from now)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const article = await prisma.newsArticle.create({
      data: {
        title,
        content,
        author,
        category: category || 'Other',
        imageURL,
        sourceURL,
        expiresAt
      }
    })

    // Broadcast the new article to all connected clients
    eventEmitter.emit(EVENTS.ARTICLE_CREATED, article)

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}
