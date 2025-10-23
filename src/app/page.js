'use client'

import { useState, useEffect } from 'react'
import ArticleForm from './components/ArticleForm'
import ArticleCard from './components/ArticleCard'
import CategorySection from './components/CategorySection'
import Notification from './components/Notification'
import { useSSE } from './hooks/useSSE'

const CATEGORIES = ['Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'Science', 'Other']

export default function Home() {
  const [articles, setArticles] = useState([])
  const [editingArticle, setEditingArticle] = useState(null)
  const [notification, setNotification] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { isConnected, addEventListener } = useSSE('/api/events')

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    if (!isConnected) return

    const cleanups = [
      addEventListener('article:created', (article) => {
        setArticles(prev => [article, ...prev])
        showNotification('New article published', 'success')
      }),

      addEventListener('article:updated', (updatedArticle) => {
        setArticles(prev =>
          prev.map(a => a.id === updatedArticle.id ? updatedArticle : a)
        )
        showNotification('Article updated', 'info')
      }),

      addEventListener('article:deleted', ({ id }) => {
        setArticles(prev => prev.filter(a => a.id !== id))
        showNotification('Article deleted', 'warning')
      })
    ]

    return () => cleanups.forEach(cleanup => cleanup && cleanup())
  }, [isConnected, addEventListener])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const data = await response.json()
      setArticles(data)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      showNotification('Failed to load articles', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (article) => {
    setEditingArticle(article)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')
    } catch (error) {
      console.error('Error deleting article:', error)
      showNotification('Failed to delete article', 'error')
    }
  }

  const handleFormSuccess = () => {
    setEditingArticle(null)
    setShowForm(false)
  }

  const handleCancelEdit = () => {
    setEditingArticle(null)
    setShowForm(false)
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
  }

  // Filter articles
  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => a.category === selectedCategory)

  // Group articles by category for "All" view
  const articlesByCategory = CATEGORIES.map(category => ({
    category,
    articles: articles.filter(a => a.category === category)
  })).filter(group => group.articles.length > 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">CHISNEWS</h1>
              <p className="text-xs text-zinc-400 mt-0.5">REAL-TIME NEWS PLATFORM</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-full">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-medium text-zinc-300">
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-white text-black px-4 py-2 rounded text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                {showForm ? '✕ CLOSE' : '+ SUBMIT NEWS'}
              </button>
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="flex gap-2 pb-4 overflow-x-auto">
            {['All', ...CATEGORIES].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Form */}
        {showForm && (
          <div className="mb-8">
            <ArticleForm
              onSuccess={handleFormSuccess}
              editArticle={editingArticle}
              onCancel={handleCancelEdit}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
            <p className="mt-4 text-zinc-400">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-zinc-300 text-xl font-semibold">No articles published yet</p>
            <p className="text-zinc-500 text-sm mt-2">Be the first to share breaking news</p>
          </div>
        ) : selectedCategory === 'All' ? (
          /* All Categories View */
          articlesByCategory.map(({ category, articles: categoryArticles }) => (
            <CategorySection
              key={category}
              category={category}
              articles={categoryArticles}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          /* Single Category View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Notifications */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50">
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        </div>
      )}
    </div>
  )
}
