import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CompleteButton from './CompleteButton'

export default async function CoursePage({ params }) {
  const { id } = await params

  const supabase = await createClient()

  // Get logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course) {
    notFound()
  }

  // Get chapters
  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index')

  const chapterIds = chapters?.map((chapter) => chapter.id) || []

  let lessons = []

  if (chapterIds.length > 0) {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('order_index')

    lessons = data || []
  }

  // Get completed lessons
  let completedLessons = []

  if (user) {
    const { data } = await supabase
      .from('progress')
      .select('lesson_id')
      .eq('user_id', user.id)

    completedLessons = data?.map((item) => item.lesson_id) || []
  }

  const progress =
  lessons.length === 0
    ? 0
    : Math.round(
        (completedLessons.length / lessons.length) * 100
      )

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-8">

        <h1 className="text-4xl font-bold mb-4">
          {course.title}
        </h1>

        <p className="text-gray-700 mb-8">
          {course.description}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <div className="border rounded-lg p-5">
            <h2 className="font-bold text-lg">
              Difficulty
            </h2>
            <p className="mt-2">
              {course.difficulty_level}
            </p>
          </div>

          <div className="border rounded-lg p-5">
            <h2 className="font-bold text-lg">
              Estimated Time
            </h2>
            <p className="mt-2">
              {course.estimated_time}
            </p>
          </div>

        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Learning Objectives
          </h2>

          <ul className="list-disc ml-6 space-y-2">
            {course.learning_objectives?.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Prerequisites
          </h2>

          <ul className="list-disc ml-6 space-y-2">
            {course.prerequisites?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

<div className="mb-8">
  <div className="flex justify-between mb-2">
    <span className="font-semibold">Course Progress</span>
    <span>{progress}%</span>
  </div>

  <div className="w-full bg-gray-200 rounded-full h-4">
    <div
      className="bg-green-600 h-4 rounded-full transition-all"
      style={{ width: `${progress}%` }}
    />
  </div>

  <p className="mt-2 text-sm text-gray-600">
    {completedLessons.length} of {lessons.length} lessons completed
  </p>
</div>

        <h2 className="text-3xl font-bold mb-6">
          Course Content
        </h2>

        {chapters?.map((chapter) => (
          <div
            key={chapter.id}
            className="border rounded-xl p-6 mb-8"
          >
            <h3 className="text-2xl font-semibold mb-5">
              Chapter {chapter.order_index}: {chapter.title}
            </h3>

            {lessons
              .filter((lesson) => lesson.chapter_id === chapter.id)
              .map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-gray-50 border rounded-lg p-5 mb-5"
                >
                  <h4 className="text-xl font-semibold">
                    Lesson {lesson.order_index}: {lesson.title}
                  </h4>

                  <p className="mt-4 whitespace-pre-wrap text-gray-700">
                    {lesson.content}
                  </p>

                  <div className="mt-5">
                    <h5 className="font-bold mb-2">
                      Key Takeaways
                    </h5>

                    <ul className="list-disc ml-6 space-y-1">
                      {lesson.key_takeaways?.map((takeaway, index) => (
                        <li key={index}>{takeaway}</li>
                      ))}
                    </ul>

                    {completedLessons.includes(lesson.id) ? (
                      <button
                        disabled
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg cursor-default"
                      >
                        ✓ Completed
                      </button>
                    ) : (
                      <CompleteButton lessonId={lesson.id} />
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}

      </div>
    </div>
  )
}