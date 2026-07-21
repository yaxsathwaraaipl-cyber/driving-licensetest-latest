import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Flag,
    Bookmark,
    Eye,
    AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

// Mock questions for practice test
const mockTestQuestions = [
    {
        id: 1,
        question: 'What does a red traffic light mean?',
        options: ['Stop', 'Go', 'Slow down', 'Yield'],
        correctAnswer: 0,
        explanation: 'A red traffic light means you must come to a complete stop behind the stop line or crosswalk.',
    },
    {
        id: 2,
        question: 'When can you overtake on the right?',
        options: ['Never', 'When the vehicle ahead is turning left', 'On highways only', 'During nighttime'],
        correctAnswer: 1,
        explanation: 'You can overtake on the right when the vehicle ahead is making a left turn and there is sufficient space.',
    },
    {
        id: 3,
        question: 'What is the maximum speed limit in residential areas?',
        options: ['25 mph', '35 mph', '45 mph', '55 mph'],
        correctAnswer: 0,
        explanation: 'The typical speed limit in residential areas is 25 mph unless otherwise posted.',
    },
    {
        id: 4,
        question: 'What should you do when approaching a school bus with flashing red lights?',
        options: ['Pass carefully', 'Stop and wait', 'Honk and pass', 'Speed up to pass quickly'],
        correctAnswer: 1,
        explanation: 'You must stop and wait until the red lights stop flashing and the bus resumes motion.',
    },
    {
        id: 5,
        question: 'What does a yield sign mean?',
        options: [
            'Stop completely',
            'Slow down and give right of way',
            'Speed up',
            'No entry'
        ],
        correctAnswer: 1,
        explanation: 'A yield sign means you must slow down and give the right of way to traffic in the intersection you are crossing.',
    },
];

export default function PracticeTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const questions = mockTestQuestions;
    const currentQ = questions[currentQuestion];

    // Timer
    useEffect(() => {
        if (isSubmitted) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isSubmitted]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optionIndex) => {
        if (isSubmitted) return;
        setAnswers({ ...answers, [currentQ.id]: optionIndex });
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowExplanation(false);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setShowExplanation(false);
        }
    };

    const handleBookmark = () => {
        if (bookmarkedQuestions.includes(currentQ.id)) {
            setBookmarkedQuestions(bookmarkedQuestions.filter(id => id !== currentQ.id));
        } else {
            setBookmarkedQuestions([...bookmarkedQuestions, currentQ.id]);
        }
    };

    const handleSubmit = () => {
        if (isSubmitted) return;
        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            const confirm = window.confirm(
                `You have ${unanswered.length} unanswered questions. Are you sure you want to submit?`
            );
            if (!confirm) return;
        }
        setIsSubmitted(true);
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) correct++;
        });
        return {
            score: Math.round((correct / questions.length) * 100),
            correct,
            total: questions.length,
            wrong: questions.length - correct,
        };
    };

    if (isSubmitted) {
        const result = calculateScore();
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="text-center p-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
                    <p className="text-gray-500 mb-6">Here's how you performed</p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-2xl font-bold text-green-600">{result.correct}</p>
                            <p className="text-sm text-green-700">Correct</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-2xl font-bold text-red-600">{result.wrong}</p>
                            <p className="text-sm text-red-700">Wrong</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-2xl font-bold text-blue-600">{result.score}%</p>
                            <p className="text-sm text-blue-700">Score</p>
                        </div>
                    </div>

                    <Badge variant={result.score >= 70 ? 'success' : 'danger'} className="text-lg px-4 py-2 mb-6">
                        {result.score >= 70 ? 'Passed! 🎉' : 'Keep Practicing! 💪'}
                    </Badge>

                    <div className="flex gap-3 justify-center">
                        <Button variant="secondary" onClick={() => navigate('/practice')}>
                            Back to Practice
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </div>
                </Card>

                {/* Review Answers */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Review Answers</h3>
                    <div className="space-y-4">
                        {questions.map((q, index) => (
                            <div key={q.id} className={`p-4 rounded-lg border ${answers[q.id] === q.correctAnswer
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                                }`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {index + 1}. {q.question}
                                        </p>
                                        <div className="mt-2 space-y-1">
                                            {q.options.map((option, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`text-sm p-2 rounded ${optIndex === q.correctAnswer
                                                        ? 'bg-green-100 text-green-700 font-medium'
                                                        : optIndex === answers[q.id] && optIndex !== q.correctAnswer
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'text-gray-600'
                                                        }`}
                                                >
                                                    {option}
                                                    {optIndex === q.correctAnswer && ' ✓'}
                                                    {optIndex === answers[q.id] && optIndex !== q.correctAnswer && ' ✗'}
                                                </div>
                                            ))}
                                        </div>
                                        {answers[q.id] !== q.correctAnswer && (
                                            <div className="mt-2 p-3 bg-blue-50 rounded text-sm text-blue-700">
                                                <strong>Explanation:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Practice Test</h1>
                    <p className="text-gray-500">Question {currentQuestion + 1} of {questions.length}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span className={timeLeft < 300 ? 'text-red-600 animate-pulse' : ''}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-primary-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Navigation */}
            <div className="flex gap-2 flex-wrap">
                {questions.map((q, index) => (
                    <button
                        key={q.id}
                        onClick={() => {
                            setCurrentQuestion(index);
                            setShowExplanation(false);
                        }}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${index === currentQuestion
                            ? 'bg-primary-600 text-white shadow-md'
                            : answers[q.id] !== undefined
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${bookmarkedQuestions.includes(q.id) ? 'ring-2 ring-yellow-400' : ''
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Question Card */}
            <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex-1">
                        {currentQ.question}
                    </h2>
                    <button
                        onClick={handleBookmark}
                        className={`p-2 rounded-lg transition-colors ml-4 ${bookmarkedQuestions.includes(currentQ.id)
                            ? 'text-yellow-500 bg-yellow-50'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                            }`}
                    >
                        <Bookmark className="h-5 w-5" fill={bookmarkedQuestions.includes(currentQ.id) ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {currentQ.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${answers[currentQ.id] === index
                                ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                                }`}
                        >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                        </button>
                    ))}
                </div>

                {/* Explanation (shown when answer is selected) */}
                {answers[currentQ.id] !== undefined && showExplanation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Explanation</p>
                                <p className="text-sm text-blue-700 mt-1">{currentQ.explanation}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => setShowExplanation(!showExplanation)}
                    icon={Eye}
                    disabled={answers[currentQ.id] === undefined}
                >
                    {showExplanation ? 'Hide' : 'Show'} Explanation
                </Button>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={handlePrevious}
                        icon={ChevronLeft}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>

                    {currentQuestion === questions.length - 1 ? (
                        <Button onClick={handleSubmit}>
                            Submit Test
                        </Button>
                    ) : (
                        <Button onClick={handleNext} icon={ChevronRight}>
                            Next
                        </Button>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
                <Button variant="outline" onClick={handleSubmit}>
                    Submit Test Early
                </Button>
            </div>
        </div>
    );
};