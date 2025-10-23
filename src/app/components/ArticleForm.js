'use client'

import { useState } from 'react'

const CATEGORIES = ['Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'Science', 'Other']

export default function ArticleForm({ onSuccess, editArticle, onCancel }) {
  const [formData, setFormData] = useState({
    title: editArticle?.title || '',
    content: editArticle?.content || '',
    author: editArticle?.author || '',
    imageURL: editArticle?.imageURL || '',
    sourceURL: editArticle?.sourceURL || '',
    category: editArticle?.category || 'Other'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageSource, setImageSource] = useState('url') // 'url' or 'upload'
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(editArticle?.imageURL || '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      let finalImageURL = formData.imageURL

      // If user uploaded a file, convert to base64
      if (imageSource === 'upload' && imageFile) {
        finalImageURL = await convertFileToBase64(imageFile)
      }

      const url = editArticle 
        ? `/api/articles/${editArticle.id}`
        : '/api/articles'
      
      const method = editArticle ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageURL: finalImageURL
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save article')
      }

      const data = await response.json()
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        author: '',
        imageURL: '',
        sourceURL: '',
        category: 'Other'
      })
      setImageFile(null)
      setImagePreview('')

      if (onSuccess) onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      setImageFile(file)
      setError('')
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Update preview for URL input
    if (name === 'imageURL' && imageSource === 'url') {
      setImagePreview(value)
    }
  }

  const handleImageSourceChange = (source) => {
    setImageSource(source)
    setImagePreview('')
    setImageFile(null)
    if (source === 'upload') {
      setFormData(prev => ({ ...prev, imageURL: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <h2 className="text-xl font-bold mb-6 text-white tracking-tight">
        {editArticle ? 'EDIT ARTICLE' : 'SUBMIT NEWS ARTICLE'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wider">
            HEADLINE *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors"
            placeholder="Enter article headline"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wider">
            ARTICLE BODY *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="8"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors resize-none"
            placeholder="Write your article content here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wider">
              AUTHOR *
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wider">
              CATEGORY *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-3 tracking-wider">
            ARTICLE IMAGE (OPTIONAL)
          </label>
          
          {/* Toggle between URL and Upload */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleImageSourceChange('url')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                imageSource === 'url'
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              📎 From URL
            </button>
            <button
              type="button"
              onClick={() => handleImageSourceChange('upload')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                imageSource === 'upload'
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              📁 Upload File
            </button>
          </div>

          {/* URL Input */}
          {imageSource === 'url' && (
            <input
              type="url"
              name="imageURL"
              value={formData.imageURL}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors"
              placeholder="https://example.com/image.jpg"
            />
          )}

          {/* File Upload */}
          {imageSource === 'upload' && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-white cursor-pointer transition-colors text-center"
              >
                {imageFile ? imageFile.name : '📤 Click to select image (Max 5MB)'}
              </label>
              <p className="text-xs text-zinc-500 mt-2">
                Supported: JPG, PNG, WebP, GIF
              </p>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4">
              <p className="text-xs text-zinc-400 mb-2">PREVIEW:</p>
              <div className="relative w-full h-48 bg-zinc-800 rounded overflow-hidden border border-zinc-700">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setImagePreview('')
                    setError('Invalid image URL or failed to load image')
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('')
                    setImageFile(null)
                    setFormData(prev => ({ ...prev, imageURL: '' }))
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wider">
            SOURCE URL (OPTIONAL)
          </label>
          <input
            type="url"
            name="sourceURL"
            value={formData.sourceURL}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-white text-black py-3 px-4 rounded hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isSubmitting ? 'PUBLISHING...' : editArticle ? 'UPDATE ARTICLE' : 'PUBLISH ARTICLE'}
        </button>
        
        {editArticle && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-zinc-700 text-zinc-400 rounded hover:bg-zinc-800 hover:text-white transition-colors font-semibold"
          >
            CANCEL
          </button>
        )}
      </div>
    </form>
  )
}
