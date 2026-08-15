'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompleteButton({ lessonId }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function markComplete() {
    if (loading) return

    setLoading(true)

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save progress')
      }

      router.refresh()
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={markComplete}
      disabled={loading}
      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
    >
      {loading ? 'Saving...' : '✓ Mark Complete'}
    </button>
  )
}