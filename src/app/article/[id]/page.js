'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ArticlePage({ params }) {
  const router = useRouter()
  const [article, setArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/articles/${resolvedParams.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Article not found')
          } else if (response.status === 410) {
            setError('This article has expired')
          } else {
            setError('Failed to load article')
          }
          return
        }

        const data = await response.json()
        setArticle(data)
      } catch (err) {
        console.error('Error fetching article:', err)
        setError('Failed to load article')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [params])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = (expiresAt) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-gray-100">
        <header className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.push('/')}
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span className="text-sm font-medium">BACK TO HOME</span>
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
            <p className="mt-4 text-zinc-400">Loading article...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-zinc-950 text-gray-100">
        <header className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.push('/')}
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span className="text-sm font-medium">BACK TO HOME</span>
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-red-400 text-xl font-semibold">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 bg-white text-black px-6 py-3 rounded hover:bg-zinc-200 transition-colors font-semibold"
            >
              GO TO HOME
            </button>
          </div>
        </main>
      </div>
    )
  }

  const daysRemaining = getDaysRemaining(article.expiresAt)

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span className="text-sm font-medium">BACK TO HOME</span>
          </button>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          {/* Article Image */}
          {article.imageURL && (
            <div className="w-full h-96 bg-zinc-800 overflow-hidden">
              <img 
                src={article.imageURL} 
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Category & Expiry Badge */}
          <div className="px-8 pt-6 pb-4 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 tracking-wider bg-zinc-800 px-3 py-1.5 rounded">
              {article.category.toUpperCase()}
            </span>
            <span className={`text-xs px-3 py-1.5 rounded font-bold ${
              daysRemaining <= 1 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
              daysRemaining <= 3 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              EXPIRES IN {daysRemaining} DAY{daysRemaining !== 1 ? 'S' : ''}
            </span>
          </div>

          {/* Title */}
          <div className="px-8 pt-8 pb-6">
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-zinc-400 pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatDate(article.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
                {article.content}
              </p>
            </div>

            {/* Source Link */}
            {article.sourceURL && (
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <p className="text-xs font-bold text-zinc-500 tracking-wider mb-3">SOURCE</p>
                <a 
                  href={article.sourceURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-zinc-300 text-sm flex items-center gap-2 transition-colors break-all"
                >
                  <span>{article.sourceURL}</span>
                  <span>→</span>
                </a>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-zinc-950 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                Last updated: {formatDate(article.updatedAt)}
              </div>
              <button
                onClick={() => router.push('/')}
                className="bg-white text-black px-6 py-2 rounded text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                BACK TO HOME
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
