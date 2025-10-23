import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/cron/cleanup - Automatically called by Vercel Cron
export async function GET(request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Delete all articles that have expired
    const result = await prisma.newsArticle.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    console.log(`Cleanup job completed: ${result.count} articles deleted at
   ${now.toISOString()}`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Failed to cleanup expired articles:", error);
    return NextResponse.json(
      { error: "Failed to cleanup expired articles" },
      { status: 500 },
    );
  }
}
