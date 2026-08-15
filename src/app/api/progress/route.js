import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()

    // Get logged in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    // Get lesson ID from request
    const { lessonId } = await request.json()

    if (!lessonId) {
      return NextResponse.json(
        {
          error: 'Lesson ID is required',
        },
        { status: 400 }
      )
    }

    // Save progress
    const { data, error } = await supabase
      .from('progress')
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )
      .select()

    if (error) {
      console.log('========== SUPABASE ERROR ==========')
      console.log(error)
      console.log('====================================')

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err) {
    console.log('========== SERVER ERROR ==========')
    console.log(err)
    console.log('=================================')

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    )
  }
}