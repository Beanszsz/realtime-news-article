'use client'

import ArticleCard from './ArticleCard'

export default function CategorySection({ category, articles, onEdit, onDelete, hideTitle }) {
  if (articles.length === 0) return null

  return (
    <section className="mb-12">
      {!hideTitle && category && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
            {category}
          </h2>
          <div className="h-1 w-16 bg-white rounded-full" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  )
}
