'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    // ==========================================
    // PASSWORD RESET
    // ==========================================

    if (isForgotPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (error) {
        setError(error.message)
      } else {
        setMessage(
          'Password reset link has been sent to your email. Please check your inbox.'
        )
      }

      setLoading(false)
      return
    }

    // ==========================================
    // SIGN UP
    // ==========================================

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage(
          'Check your email to confirm your account, then log in.'
        )
        setIsSignUp(false)
      }
    }

    // ==========================================
    // LOGIN
    // ==========================================

    else {
      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }

    setLoading(false)
  }

  // ==========================================
  // FORGOT PASSWORD SCREEN
  // ==========================================

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

          <h1 className="text-2xl font-bold mb-2 text-center">
            Reset Password
          </h1>

          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your email and we&apos;ll send you a password
            reset link.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm text-green-600">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Sending...'
                : 'Send Reset Link'}
            </button>
          </form>

          <button
            onClick={() => {
              setIsForgotPassword(false)
              setError('')
              setMessage('')
            }}
            className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
          >
            Back to Log In
          </button>

        </div>
      </div>
    )
  }

  // ==========================================
  // LOGIN / SIGNUP SCREEN
  // ==========================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Log In'}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            minLength={6}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : isSignUp
                ? 'Sign Up'
                : 'Log In'}
          </button>
        </form>

        {/* Forgot Password */}

        {!isSignUp && (
          <button
            onClick={() => {
              setIsForgotPassword(true)
              setError('')
              setMessage('')
            }}
            className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
          >
            Forgot password?
          </button>
        )}

        {/* Login / Signup Toggle */}

        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError('')
            setMessage('')
          }}
          className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
        >
          {isSignUp
            ? 'Already have an account? Log in'
            : "Don't have an account? Sign up"}
        </button>

      </div>
    </div>
  )
}