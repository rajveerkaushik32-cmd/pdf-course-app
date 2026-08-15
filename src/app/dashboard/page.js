import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import UploadForm from './UploadForm'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Your Dashboard
            </h1>

            <p className="text-gray-600">
              {user.email}
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Upload a PDF
          </h2>

          <UploadForm />
        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-5">
            Your Courses
          </h2>

          {(!courses || courses.length === 0) && (
            <p className="text-gray-500">
              No courses uploaded yet.
            </p>
          )}

          {courses?.map((course) => (

            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="block border rounded-lg p-5 mb-4 hover:bg-gray-50 transition"
            >
              <h3 className="text-xl font-semibold text-blue-600">
                {course.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {course.description}
              </p>

              <div className="flex gap-8 mt-4 text-sm text-gray-500">

                <span>
                  Difficulty: {course.difficulty_level}
                </span>

                <span>
                  Time: {course.estimated_time}
                </span>

              </div>

            </Link>

          ))}

        </div>

      </div>
    </div>
  )
}