'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

export default function RoadmapAdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    progress: 0,
    status: 'not_started',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('roadmap_items')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          progress: formData.progress,
          status: formData.status,
        })

      if (insertError) throw insertError

      setSuccess('Roadmap item added successfully! 🎉')
      setFormData({
        title: '',
        description: '',
        progress: 0,
        status: 'not_started',
      })

      // Redirect to roadmap after 1 second
      setTimeout(() => router.push('/roadmap'), 1000)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to add roadmap item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-2">Add Roadmap Item</h1>
        <p className="text-gray-600 mb-8">Create a new skill gap or learning goal</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-[#EBEBE3]">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Learn React Hooks"
              required
              className="w-full px-4 py-2.5 border border-[#EBEBE3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B7355]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What is this skill gap about?"
              rows={3}
              className="w-full px-4 py-2.5 border border-[#EBEBE3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B7355]"
            />
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-semibold mb-2">Progress (%)</label>
            <input
              type="range"
              name="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-1">{formData.progress}% complete</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-[#EBEBE3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B7355]"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#E29D38] text-white rounded-lg hover:bg-[#D48F2A] disabled:opacity-50 font-semibold"
            >
              {loading ? 'Adding...' : 'Add Roadmap Item'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/roadmap')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}