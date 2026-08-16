'use client'

import { useState } from 'react'

export default function QuizSection({ quizzes }) {
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)

    const handleAnswer = (quizId, answer) => {
        setAnswers((previous) => ({
            ...previous,
            [quizId]: answer,
        }))
    }

    const handleSubmit = () => {
        setSubmitted(true)
    }

    const handleRetry = () => {
        setAnswers({})
        setSubmitted(false)
    }

    const score = quizzes.reduce((total, quiz) => {
        if (
            answers[quiz.id] &&
            answers[quiz.id] === quiz.correct_answer
        ) {
            return total + 1
        }

        return total
    }, 0)

    return (
        <div className="space-y-6">

            {quizzes.map((quiz, index) => (
                <div
                    key={quiz.id}
                    className="border rounded-lg p-5 bg-white"
                >

                    <h5 className="font-semibold text-lg mb-4">
                        {index + 1}. {quiz.question}
                    </h5>

                    {/* MCQ */}

                    {quiz.question_type === 'mcq' &&
                        Array.isArray(quiz.options) && (
                            <div className="space-y-3">

                                {quiz.options.map(
                                    (option, optionIndex) => {

                                        const selected =
                                            answers[quiz.id] === option

                                        const correct =
                                            quiz.correct_answer === option

                                        let className =
                                            'border rounded-lg p-3 cursor-pointer transition '

                                        if (
                                            submitted &&
                                            correct
                                        ) {
                                            className +=
                                                'bg-green-100 border-green-500'
                                        } else if (
                                            submitted &&
                                            selected &&
                                            !correct
                                        ) {
                                            className +=
                                                'bg-red-100 border-red-500'
                                        } else if (selected) {
                                            className +=
                                                'bg-blue-100 border-blue-500'
                                        } else {
                                            className +=
                                                'hover:bg-gray-100'
                                        }

                                        return (
                                            <label
                                                key={optionIndex}
                                                className={className}
                                            >

                                                <input
                                                    type="radio"
                                                    name={`quiz-${quiz.id}`}
                                                    value={option}
                                                    checked={
                                                        selected
                                                    }
                                                    disabled={
                                                        submitted
                                                    }
                                                    onChange={() =>
                                                        handleAnswer(
                                                            quiz.id,
                                                            option
                                                        )
                                                    }
                                                    className="mr-3"
                                                />

                                                {option}

                                            </label>
                                        )
                                    }
                                )}

                            </div>
                        )}

                    {/* TRUE / FALSE */}

                    {quiz.question_type === 'true_false' && (
                        <div className="space-y-3">

                            {['True', 'False'].map(
                                (option) => {

                                    const selected =
                                        answers[quiz.id] === option

                                    const correct =
                                        quiz.correct_answer === option

                                    let className =
                                        'border rounded-lg p-3 cursor-pointer transition '

                                    if (
                                        submitted &&
                                        correct
                                    ) {
                                        className +=
                                            'bg-green-100 border-green-500'
                                    } else if (
                                        submitted &&
                                        selected &&
                                        !correct
                                    ) {
                                        className +=
                                            'bg-red-100 border-red-500'
                                    } else if (selected) {
                                        className +=
                                            'bg-blue-100 border-blue-500'
                                    } else {
                                        className +=
                                            'hover:bg-gray-100'
                                    }

                                    return (
                                        <label
                                            key={option}
                                            className={className}
                                        >

                                            <input
                                                type="radio"
                                                name={`quiz-${quiz.id}`}
                                                value={option}
                                                checked={
                                                    selected
                                                }
                                                disabled={
                                                    submitted
                                                }
                                                onChange={() =>
                                                    handleAnswer(
                                                        quiz.id,
                                                        option
                                                    )
                                                }
                                                className="mr-3"
                                            />

                                            {option}

                                        </label>
                                    )
                                }
                            )}

                        </div>
                    )}

                    {/* RESULT */}

                    {submitted && (
                        <div className="mt-4 p-4 rounded-lg bg-gray-50">

                            <p className="font-semibold">
                                Correct Answer:{' '}
                                <span className="text-green-600">
                                    {quiz.correct_answer}
                                </span>
                            </p>

                            {quiz.explanation && (
                                <p className="mt-2 text-gray-700">
                                    <strong>Explanation:</strong>{' '}
                                    {quiz.explanation}
                                </p>
                            )}

                        </div>
                    )}

                </div>
            ))}

            {/* ==========================================
          QUIZ BUTTON
      ========================================== */}

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={
                        Object.keys(answers).length !==
                        quizzes.length
                    }
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit Quiz
                </button>
            ) : (
                <div className="text-center">

                    <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg mb-4">

                        <h4 className="text-2xl font-bold">
                            Quiz Result
                        </h4>

                        <p className="text-xl mt-2">
                            You scored{' '}
                            <span className="font-bold">
                                {score}/{quizzes.length}
                            </span>
                        </p>

                        <p className="mt-2 text-gray-600">
                            {Math.round(
                                (score / quizzes.length) * 100
                            )}
                            %
                        </p>

                    </div>

                    <button
                        onClick={handleRetry}
                        className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900"
                    >
                        Try Again
                    </button>

                </div>
            )}

        </div>
    )
}