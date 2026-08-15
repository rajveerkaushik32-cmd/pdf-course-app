import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()

    // ==========================================
    // 1. Check logged-in user
    // ==========================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    // ==========================================
    // 2. Get uploaded PDF
    // ==========================================

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file uploaded',
        },
        { status: 400 }
      )
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only PDF files are allowed',
        },
        { status: 400 }
      )
    }

    // ==========================================
    // 3. Convert PDF to Buffer
    // ==========================================

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // ==========================================
    // 4. Upload PDF to Supabase Storage
    // ==========================================

    const filePath = `${user.id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)

      return NextResponse.json(
        {
          success: false,
          error: uploadError.message,
        },
        { status: 500 }
      )
    }

    // ==========================================
    // 5. Send PDF to deployed FastAPI backend
    // ==========================================

    const aiFormData = new FormData()

    aiFormData.append(
      'file',
      new Blob([buffer], {
        type: 'application/pdf',
      }),
      file.name
    )

    let aiResponse

    try {
      aiResponse = await fetch(
        'https://pdf-course-app.onrender.com/generate-course',
        {
          method: 'POST',
          body: aiFormData,
        }
      )
    } catch (error) {
      console.error('FastAPI connection error:', error)

      return NextResponse.json(
        {
          success: false,
          error:
            'Could not connect to the AI backend. Please try again.',
        },
        { status: 500 }
      )
    }

    // ==========================================
    // 6. Check AI response
    // ==========================================

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()

      console.error('FastAPI error:', errorText)

      return NextResponse.json(
        {
          success: false,
          error: errorText || 'AI course generation failed',
        },
        { status: 500 }
      )
    }

    const aiData = await aiResponse.json()

    // Supports both:
    // { course: {...} }
    // and
    // { title: "...", chapters: [...] }

    const aiCourse = aiData.course || aiData

    if (!aiCourse || !aiCourse.title) {
      console.error('Invalid AI course response:', aiData)

      return NextResponse.json(
        {
          success: false,
          error: 'AI returned an invalid course response',
        },
        { status: 500 }
      )
    }

    // ==========================================
    // 7. Save Course
    // ==========================================

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        user_id: user.id,
        title: aiCourse.title,
        description: aiCourse.description || '',
        estimated_time: aiCourse.estimated_time || '',
        learning_objectives:
          aiCourse.learning_objectives || [],
        prerequisites:
          aiCourse.prerequisites || [],
        difficulty_level:
          aiCourse.difficulty || '',
        pdf_filename: filePath,
        raw_text: '',
        status: 'completed',
      })
      .select()
      .single()

    if (courseError) {
      console.error('Course save error:', courseError)

      return NextResponse.json(
        {
          success: false,
          error: courseError.message,
        },
        { status: 500 }
      )
    }

    // ==========================================
    // 8. Save Chapters
    // ==========================================

    if (
      aiCourse.chapters &&
      Array.isArray(aiCourse.chapters)
    ) {
      for (
        let chapterIndex = 0;
        chapterIndex < aiCourse.chapters.length;
        chapterIndex++
      ) {
        const chapter = aiCourse.chapters[chapterIndex]

        // ==========================================
        // Save Chapter
        // ==========================================

        const {
          data: savedChapter,
          error: chapterError,
        } = await supabase
          .from('chapters')
          .insert({
            course_id: course.id,
            title:
              chapter.title ||
              `Chapter ${chapterIndex + 1}`,
            order_index: chapterIndex + 1,
          })
          .select()
          .single()

        if (chapterError) {
          console.error(
            'Chapter save error:',
            chapterError
          )

          continue
        }

        // ==========================================
        // 9. Save Lessons
        // ==========================================

        if (
          chapter.lessons &&
          Array.isArray(chapter.lessons)
        ) {
          for (
            let lessonIndex = 0;
            lessonIndex < chapter.lessons.length;
            lessonIndex++
          ) {
            const lesson =
              chapter.lessons[lessonIndex]

            const { error: lessonError } =
              await supabase
                .from('lessons')
                .insert({
                  chapter_id: savedChapter.id,
                  title:
                    lesson.title ||
                    `Lesson ${lessonIndex + 1}`,
                  content:
                    lesson.content || '',
                  key_takeaways:
                    lesson.key_takeaways || [],
                  order_index: lessonIndex + 1,
                })

            if (lessonError) {
              console.error(
                'Lesson save error:',
                lessonError
              )
            }
          }
        }

        // ==========================================
        // 10. Save Quizzes
        // ==========================================

        if (
          chapter.quiz &&
          Array.isArray(chapter.quiz)
        ) {
          for (
            let quizIndex = 0;
            quizIndex < chapter.quiz.length;
            quizIndex++
          ) {
            const quiz =
              chapter.quiz[quizIndex]

            const { error: quizError } =
              await supabase
                .from('quizzes')
                .insert({
                  chapter_id: savedChapter.id,

                  question:
                    quiz.question || '',

                  question_type:
                    quiz.question_type || 'mcq',

                  options:
                    quiz.options || [],

                  correct_answer:
                    quiz.correct_answer || '',

                  explanation:
                    quiz.explanation || '',

                  order_index:
                    quizIndex + 1,
                })

            if (quizError) {
              console.error(
                'Quiz save error:',
                quizError
              )
            }
          }
        }
      }
    }

    // ==========================================
    // 11. Return Success
    // ==========================================

    return NextResponse.json({
      success: true,
      message: 'Course generated successfully',
      course: course,
    })
  } catch (error) {
    console.error(
      '========== UPLOAD API ERROR =========='
    )

    console.error(error)

    console.error(
      '======================================'
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          'Something went wrong while processing the PDF',
      },
      { status: 500 }
    )
  }
}