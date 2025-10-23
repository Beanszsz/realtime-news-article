'use client'

import { useRouter } from 'next/navigation'

export default function ArticleCard({ article, onEdit, onDelete }) {
  const router = useRouter()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
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

  const handleCardClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('button') || e.target.closest('a')) {
      return
    }
    router.push(`/article/${article.id}`)
  }

  const daysRemaining = getDaysRemaining(article.expiresAt)

  return (
    <article 
      onClick={handleCardClick}
      className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all group cursor-pointer"
    >
      {/* Image Headline */}
      {article.imageURL && (
        <div className="relative w-full h-48 bg-zinc-800 overflow-hidden">
          <img 
            src={article.imageURL} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.style.display = 'none'
            }}
          />
          {/* Category Badge Overlay on Image */}
          <div className="absolute top-3 left-3">
            <span className="text-xs font-bold text-white bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded tracking-wider">
              {article.category.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Category Badge (when no image) */}
      {!article.imageURL && (
        <div className="px-5 pt-4 pb-2">
          <span className="text-xs font-bold text-zinc-500 tracking-wider">
            {article.category.toUpperCase()}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="px-5 pb-4">
        <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-zinc-300 transition-colors pt-4">
          {article.title}
        </h3>

        <p className="text-zinc-400 text-sm mb-4 line-clamp-3 leading-relaxed">
          {article.content}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-800">
          <span className="font-medium">{article.author}</span>
          <span>{formatDate(article.createdAt)}</span>
        </div>

        {/* Source Link */}
        {article.sourceURL && (
          <a 
            href={article.sourceURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white text-xs flex items-center gap-1 mb-4 transition-colors"
          >
            <span>View Source</span>
            <span>→</span>
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(article)}
              className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors font-medium"
            >
              EDIT
            </button>
            <button
              onClick={() => onDelete(article.id)}
              className="text-xs text-zinc-400 hover:text-red-400 px-3 py-1.5 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors font-medium"
            >
              DELETE
            </button>
          </div>
          
          <span className={`text-xs px-2.5 py-1 rounded font-bold ${
            daysRemaining <= 1 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
            daysRemaining <= 3 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {daysRemaining}D
          </span>
        </div>
      </div>
    </article>
  )
}
