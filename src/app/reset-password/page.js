'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)

    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (session) {
                setChecking(false)
            } else {
                setError(
                    'This password reset link is invalid or has expired. Please request a new reset link.'
                )
                setChecking(false)
            }
        }

        checkSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    setError('')
                    setChecking(false)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const handleResetPassword = async (e) => {
        e.preventDefault()

        setError('')
        setMessage('')

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)

        const supabase = createClient()

        const { error } = await supabase.auth.updateUser({
            password: password,
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage(
                'Password updated successfully! Redirecting to login...'
            )

            setPassword('')
            setConfirmPassword('')

            setTimeout(() => {
                router.push('/login')
                router.refresh()
            }, 2000)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

                <h1 className="text-2xl font-bold mb-2 text-center">
                    Reset Password
                </h1>

                {checking ? (
                    <p className="text-sm text-gray-600 text-center mt-6">
                        Verifying reset link...
                    </p>
                ) : error && !message ? (
                    <div className="mt-6">
                        <p className="text-sm text-red-600 text-center">
                            {error}
                        </p>

                        <button
                            onClick={() => router.push('/login')}
                            className="mt-6 w-full text-sm text-blue-600 hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-600 text-center mb-6">
                            Enter your new password below.
                        </p>

                        <form
                            onSubmit={handleResetPassword}
                            className="space-y-4"
                        >
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
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
                                    ? 'Updating...'
                                    : 'Update Password'}
                            </button>
                        </form>

                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
                        >
                            Back to Login
                        </button>
                    </>
                )}

            </div>
        </div>
    )
}