import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { eventEmitter, EVENTS } from "@/lib/events";

//GET /api/articles/[id] will get the single article
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const article = await prisma.newsArticle.findUnique({
      where: { id: parseInt(id) },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (new Date(article.expiresAt) < new Date())
      return NextResponse.json({ error: "Article expired" }, { status: 410 });

    return NextResponse.json(article);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get the Article" },
      { status: 500 },
    );
  }
}

// PUT /api/articles/[id] - will update an Article
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, author, category, imageURL, sourceURL } = body;

    const updatedArticle = await prisma.newsArticle.update({
      where: { id: parseInt(id) },
      data: { title, content, author, category, imageURL, sourceURL },
    });

    // Broadcast the updated article to all connected clients
    eventEmitter.emit(EVENTS.ARTICLE_UPDATED, updatedArticle);

    return NextResponse.json(updatedArticle);
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: "Failed to update the Article" },
      { status: 500 },
    );
  }
}

// DELETE /api/articles/[id] - Delete an article
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.newsArticle.delete({
      where: { id: parseInt(id) },
    });

    // Broadcast the deletion to all connected clients
    eventEmitter.emit(EVENTS.ARTICLE_DELETED, { id: parseInt(id) });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 },
    );
  }
}
