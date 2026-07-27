// pages/TestStart.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
    Loader2, AlertCircle, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, Timer, Award, FileText,
    BookOpen, Shield, AlertTriangle, ListChecks,
    Flag, ArrowLeft, Lock, Unlock, Sparkles, 
    BarChart3, ThumbsUp, ThumbsDown, Medal,
    Clock, Send, HelpCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { testService } from '../../services/testService';
import { ROUTES } from '../../constants';
import { useAuthStore } from '../../store/authStore';

// ====== Helper Functions ======
const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getTimerColor = (timeLeft) => {
    if (timeLeft === null) return 'text-gray-600';
    if (timeLeft < 60) return 'text-red-600';
    if (timeLeft < 180) return 'text-yellow-600';
    return 'text-green-600';
};

const getTimerBg = (timeLeft) => {
    if (timeLeft === null) return 'bg-gray-50';
    if (timeLeft < 60) return 'bg-red-50 border-red-200';
    if (timeLeft < 180) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
};

// ====== Main Component ======
export default function TestStart() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const userId = user?.id || user?._id;
    
    // ====== State ======
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [startTime, setStartTime] = useState(null);

    // ====== Fetch Test Data ======
    const { 
        data: testData, 
        isLoading, 
        isError, 
        error,
        refetch
    } = useQuery({
        queryKey: ['test-start', testId, userId],
        queryFn: () => {
            if (!userId) throw new Error('User ID required');
            return testService.startTest(testId, userId);
        },
        enabled: !!testId && !!userId,
        retry: 1,
        staleTime: 0,
    });

    // ====== Effects ======
    // Store attemptId and start timer
    useEffect(() => {
        if (testData?.categoryTimers) {
            const firstCategory = Object.values(testData.categoryTimers)[0];
            if (firstCategory) {
                setTimeLeft(firstCategory.timer * 60);
            }
        }
        if (testData?.attemptId) {
            setAttemptId(testData.attemptId);
        }
        if (!startTime) {
            setStartTime(Date.now());
        }
    }, [testData]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || showResults) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, showResults]);

    // ====== Computed Values ======
    const getTimeTaken = () => {
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 60000);
    };

    const totalQuestions = testData?.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;
    const reviewCount = Object.keys(markedForReview).filter(id => markedForReview[id]).length;
    const unansweredCount = totalQuestions - answeredCount;
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
    const questions = testData?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    // ====== Handlers ======
    const handleAutoSubmit = () => {
        if (isAllAnswered && totalQuestions > 0) {
            handleSubmitTest();
        }
    };

    const handleAnswerSelect = (questionId, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
        setMarkedForReview(prev => {
            const newState = { ...prev };
            delete newState[questionId];
            return newState;
        });
    };

    const toggleMarkForReview = (questionId) => {
        setMarkedForReview(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleJumpToQuestion = (index) => {
        setCurrentQuestionIndex(index);
        setShowSummary(false);
    };

    const getQuestionStatus = (questionId) => {
        if (answers[questionId] !== undefined) return 'answered';
        if (markedForReview[questionId]) return 'review';
        return 'unanswered';
    };

    // ====== Submit Test ======
    const submitMutation = useMutation({
        mutationFn: (data) => {
            const timeTaken = getTimeTaken();
            return testService.submitTest(testId, {
                attemptId: attemptId || data.attemptId,
                answers: data.answers,
                timeTaken: timeTaken,
                userId: userId
            });
        },
        onSuccess: (response) => {
            console.log('✅ Test submitted successfully:', response);
            setIsSubmitting(false);
            setShowConfirmSubmit(false);
            setTestResults(response.data || response);
            setShowResults(true);
            setShowSummary(false);
        },
        onError: (error) => {
            console.error('❌ Error submitting test:', error);
            setIsSubmitting(false);
            setShowConfirmSubmit(false);
            alert('Failed to submit test. Please try again.');
        }
    });

    const handleSubmitTest = () => {
        setIsSubmitting(true);
        setShowConfirmSubmit(false);
        setShowSummary(false);
        
        const formattedAnswers = Object.entries(answers).map(([questionId, optionIndex]) => ({
            questionId,
            selectedOption: optionIndex
        }));

        submitMutation.mutate({ 
            answers: formattedAnswers,
            attemptId: attemptId
        });
    };

    // ====== Result Stats ======
    const getResultStats = () => {
        if (!testResults) return null;
        
        const totalMarks = testResults.totalMarks || testResults.totalScore || 0;
        const obtainedMarks = testResults.obtainedMarks || testResults.score || 0;
        const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
        const isPassed = percentage >= (testResults.passingPercentage || 50);
        const correctAnswers = testResults.correctAnswers || 0;
        const wrongAnswers = testResults.wrongAnswers || 0;
        
        return { totalMarks, obtainedMarks, percentage, isPassed, correctAnswers, wrongAnswers };
    };

    // ====== Render Helpers ======
    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="text-center">
                <p className="text-xl font-semibold text-gray-700">Loading your test...</p>
                <p className="text-sm text-gray-400 mt-1">Please wait while we prepare your questions</p>
            </div>
        </div>
    );

    const renderError = () => (
        <div className="flex items-center justify-center min-h-[70vh]">
            <Card className="p-12 text-center max-w-2xl mx-auto">
                <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Unable to Load Test</h3>
                    <p className="text-gray-500 mt-3">
                        {error?.message || 'Something went wrong. Please try again.'}
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Button onClick={() => refetch()} className="px-6">
                            <Loader2 className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/tests')}>
                            Back to Tests
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );

    // ====== Render Results ======
    if (showResults && testResults) {
        const stats = getResultStats();
        const resultQuestions = testResults.questions || testResults.detailedResults || [];
        
        return (
            <div className="space-y-6 max-w-5xl mx-auto pb-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Medal className="h-8 w-8" />
                                Test Results
                            </h2>
                            <p className="text-blue-100 mt-1">{testData.title}</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold">{stats.percentage}%</div>
                                <div className="text-sm text-blue-100">Score</div>
                            </div>
                            <div className={`px-6 py-3 rounded-full font-semibold text-lg shadow-lg ${
                                stats.isPassed ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                                {stats.isPassed ? (
                                    <span className="flex items-center gap-2">
                                        <ThumbsUp className="h-5 w-5" />
                                        Passed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ThumbsDown className="h-5 w-5" />
                                        Failed
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-5 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="text-3xl font-bold text-green-600">{stats.obtainedMarks}</div>
                        <div className="text-sm text-gray-600 mt-1">Obtained Marks</div>
                    </Card>
                    <Card className="p-5 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="text-3xl font-bold text-blue-600">{stats.totalMarks}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Marks</div>
                    </Card>
                    <Card className="p-5 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="text-3xl font-bold text-green-600">{stats.correctAnswers}</div>
                        <div className="text-sm text-gray-600 mt-1">Correct</div>
                    </Card>
                    <Card className="p-5 text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <div className="text-3xl font-bold text-red-600">{stats.wrongAnswers}</div>
                        <div className="text-sm text-gray-600 mt-1">Wrong</div>
                    </Card>
                </div>

                {/* Detailed Review */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Detailed Review
                        </h3>
                        <Badge variant="info" className="px-3 py-1">
                            {stats.correctAnswers} Correct / {stats.wrongAnswers} Wrong
                        </Badge>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {(resultQuestions.length > 0 ? resultQuestions : questions).map((q, idx) => {
                            const userAnswer = answers[q.questionId];
                            const correctAnswer = q.correctOption !== undefined ? q.correctOption : null;
                            const isCorrect = userAnswer === correctAnswer;
                            
                            return (
                                <div 
                                    key={q.questionId || idx} 
                                    className={`border-2 rounded-xl p-5 transition-all hover:shadow-md ${
                                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                                            isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{q.questionText}</p>
                                            <div className="mt-3 space-y-2 text-sm">
                                                <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                                                    <span className="font-medium text-gray-600">Your Answer:</span>
                                                    <span className={isCorrect ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                                        {userAnswer !== undefined && q.options && q.options[userAnswer] 
                                                            ? q.options[userAnswer].text 
                                                            : 'Not Answered'}
                                                    </span>
                                                    {isCorrect ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500" />
                                                    )}
                                                </div>
                                                {!isCorrect && correctAnswer !== null && q.options && q.options[correctAnswer] && (
                                                    <div className="flex items-center gap-3 p-2 bg-green-50/80 rounded-lg border border-green-200">
                                                        <span className="font-medium text-green-600">Correct Answer:</span>
                                                        <span className="text-green-700 font-semibold">{q.options[correctAnswer].text}</span>
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button variant="primary" onClick={() => navigate('/tests')} className="px-8 py-3">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Tests
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/results')} className="px-8 py-3">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View All Results
                    </Button>
                </div>
            </div>
        );
    }

    // ====== Render Summary ======
    if (showSummary) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <ListChecks className="h-6 w-6 text-blue-500" />
                                Test Summary
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">{testData.title}</p>
                        </div>
                        <Button variant="outline" onClick={() => setShowSummary(false)} className="px-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Questions
                        </Button>
                    </div>
                </div>

                <div className={`rounded-xl border-2 p-6 ${
                    isAllAnswered ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
                }`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${isAllAnswered ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            {isAllAnswered ? (
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            ) : (
                                <AlertCircle className="h-8 w-8 text-yellow-600" />
                            )}
                        </div>
                        <div>
                            <h4 className={`text-lg font-bold ${isAllAnswered ? 'text-green-700' : 'text-yellow-700'}`}>
                                {isAllAnswered ? '🎉 All Questions Answered!' : '⚠️ Incomplete Test'}
                            </h4>
                            <p className={`text-sm ${isAllAnswered ? 'text-green-600' : 'text-yellow-600'}`}>
                                {isAllAnswered 
                                    ? "You're ready to submit your test." 
                                    : `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}.`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-5 text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-gray-900">{totalQuestions}</div>
                        <div className="text-sm text-gray-500 mt-1">Total Questions</div>
                    </Card>
                    <Card className={`p-5 text-center border-2 ${isAllAnswered ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <div className="text-3xl font-bold text-green-600">{answeredCount}</div>
                        <div className="text-sm text-gray-500 mt-1">Answered</div>
                    </Card>
                    <Card className="p-5 text-center border-yellow-200 bg-yellow-50">
                        <div className="text-3xl font-bold text-yellow-600">{reviewCount}</div>
                        <div className="text-sm text-gray-500 mt-1">For Review</div>
                    </Card>
                    <Card className={`p-5 text-center border-2 ${unansweredCount === 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className={`text-3xl font-bold ${unansweredCount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {unansweredCount}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Unanswered</div>
                    </Card>
                </div>

                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{Math.round(progressPercentage)}% Complete</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                                isAllAnswered 
                                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {questions.map((q, idx) => {
                        const status = getQuestionStatus(q.questionId);
                        const statusConfig = {
                            answered: { color: 'border-green-200 bg-green-50 hover:bg-green-100', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
                            review: { color: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100', icon: <Flag className="h-5 w-5 text-yellow-500" /> },
                            unanswered: { color: 'border-red-200 bg-red-50 hover:bg-red-100', icon: <AlertCircle className="h-5 w-5 text-red-500" /> }
                        };
                        return (
                            <button
                                key={q.questionId || idx}
                                onClick={() => handleJumpToQuestion(idx)}
                                className={`p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${statusConfig[status].color}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-bold text-gray-700">Q{idx + 1}</span>
                                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">
                                            {q.questionText}
                                        </p>
                                    </div>
                                    {statusConfig[status].icon}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-6">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setShowConfirmSubmit(true)}
                        disabled={!isAllAnswered || isSubmitting}
                        className={`px-10 py-3 text-lg ${!isAllAnswered ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                                Submitting...
                            </>
                        ) : !isAllAnswered ? (
                            <>
                                <Lock className="h-5 w-5 mr-3" />
                                Answer All Questions First
                            </>
                        ) : (
                            <>
                                <Unlock className="h-5 w-5 mr-3" />
                                Submit Test
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    // ====== Main Test View ======
    // User not logged in
    if (!userId) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <Card className="p-12 text-center max-w-2xl mx-auto">
                    <div className="max-w-md mx-auto">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900">User Not Found</h3>
                        <p className="text-gray-500 mt-3">Please log in to take the test.</p>
                        <Button className="mt-8" onClick={() => navigate('/login')}>
                            Go to Login
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Loading
    if (isLoading) return renderLoading();

    // Error
    if (isError) return renderError();

    // No Data
    if (!testData) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <Card className="p-12 text-center max-w-2xl mx-auto">
                    <div className="max-w-md mx-auto">
                        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900">No Test Data</h3>
                        <p className="text-gray-500 mt-3">The test could not be loaded.</p>
                        <Button className="mt-8" onClick={() => navigate('/tests')}>
                            Back to Tests
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // ====== Main Render ======
    return (
        <div className="space-y-4 max-w-5xl mx-auto pb-8">
            {/* Header with Timer */}
            <div className="bg-white rounded-xl border shadow-sm p-5 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            {testData.title}
                        </h1>
                        <p className="text-sm text-gray-500 truncate">{testData.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getTimerBg(timeLeft)}`}>
                            <Timer className={`h-5 w-5 ${getTimerColor(timeLeft)}`} />
                            <span className={`font-mono font-bold text-base ${getTimerColor(timeLeft)}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        <Badge 
                            variant={isAllAnswered ? "success" : "info"} 
                            className="px-4 py-2 text-sm font-medium"
                        >
                            {answeredCount}/{totalQuestions}
                        </Badge>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                                isAllAnswered 
                                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    {isAllAnswered && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-2 animate-pulse">
                            <Sparkles className="h-3 w-3" />
                            All questions answered! Ready to submit.
                        </p>
                    )}
                </div>
            </div>

            {/* Question Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm bg-white rounded-xl border shadow-sm p-4">
                <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Question <span className="font-bold text-gray-700">{currentQuestionIndex + 1}</span> of <span className="font-bold text-gray-700">{totalQuestions}</span>
                </span>
                <span className="w-px h-6 bg-gray-200" />
                <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span className="font-bold text-gray-700">{currentQuestion?.marks || 0}</span> marks
                </span>
                <span className="w-px h-6 bg-gray-200" />
                <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-gray-700">{currentQuestion?.categoryName || 'General'}</span>
                </span>
                {isAllAnswered && (
                    <>
                        <span className="w-px h-6 bg-gray-200" />
                        <span className="flex items-center gap-2 text-green-600 font-medium">
                            <CheckCircle className="h-4 w-4" />
                            All Complete
                        </span>
                    </>
                )}
            </div>

            {/* Quick Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
                {questions.map((q, idx) => {
                    const status = getQuestionStatus(q.questionId);
                    const isActive = currentQuestionIndex === idx;
                    let bgColor = 'bg-gray-100 text-gray-600';
                    let borderColor = 'border-gray-200';
                    
                    if (status === 'answered') {
                        bgColor = 'bg-green-100 text-green-700';
                        borderColor = 'border-green-300';
                    } else if (status === 'review') {
                        bgColor = 'bg-yellow-100 text-yellow-700';
                        borderColor = 'border-yellow-300';
                    }
                    
                    if (isActive) {
                        borderColor = 'border-blue-500 ring-2 ring-blue-500 ring-offset-2';
                    }
                    
                    return (
                        <button
                            key={q.questionId || idx}
                            onClick={() => handleJumpToQuestion(idx)}
                            className={`flex-shrink-0 w-10 h-10 rounded-full text-xs font-bold border-2 transition-all hover:scale-110 ${bgColor} ${borderColor} relative`}
                        >
                            {idx + 1}
                            {status === 'answered' && (
                                <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
                            )}
                            {status === 'review' && (
                                <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Question */}
            <Card className="p-7 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <div className="space-y-5">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl text-base font-bold shadow-md">
                                Q{currentQuestionIndex + 1}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                                {currentQuestion?.questionText}
                            </p>
                            {currentQuestion?.questionImage && (
                                <img 
                                    src={currentQuestion.questionImage} 
                                    alt="Question" 
                                    className="mt-4 max-h-56 rounded-xl border shadow-sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="mt-6 space-y-3 pl-16">
                        {currentQuestion?.options?.map((option, idx) => {
                            const isSelected = answers[currentQuestion.questionId] === idx;
                            const optionLabel = String.fromCharCode(65 + idx);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(currentQuestion.questionId, idx)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group
                                        ${isSelected 
                                            ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]' 
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all
                                            ${isSelected 
                                                ? 'border-blue-500 bg-blue-500 text-white shadow-md' 
                                                : 'border-gray-300 text-gray-500 group-hover:border-blue-400'
                                            }
                                        `}>
                                            {optionLabel}
                                        </span>
                                        <span className={`text-base transition-all ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                                            {option.text}
                                        </span>
                                        {isSelected && (
                                            <CheckCircle className="ml-auto h-6 w-6 text-blue-500" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button
                        variant="outline"
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex-1 lg:flex-none px-6"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        className="flex-1 lg:flex-none px-6"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => toggleMarkForReview(currentQuestion?.questionId)}
                        className={`flex-1 lg:flex-none px-4 ${
                            markedForReview[currentQuestion?.questionId] 
                                ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100' 
                                : ''
                        }`}
                    >
                        <Flag className={`h-4 w-4 mr-2 ${markedForReview[currentQuestion?.questionId] ? 'fill-yellow-500' : ''}`} />
                        {markedForReview[currentQuestion?.questionId] ? 'Unmark' : 'Mark for Review'}
                    </Button>
                    
                    <Button
                        variant="outline"
                        onClick={() => setShowSummary(true)}
                        className="flex-1 lg:flex-none px-4"
                    >
                        <ListChecks className="h-4 w-4 mr-2" />
                        Summary
                    </Button>

                    {isAllAnswered ? (
                        <Button
                            variant="primary"
                            onClick={() => setShowConfirmSubmit(true)}
                            disabled={isSubmitting}
                            className="flex-1 lg:flex-none px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all animate-pulse"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Submit
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex-1 lg:flex-none relative group">
                            <Button
                                variant="outline"
                                disabled={true}
                                className="w-full opacity-60 cursor-not-allowed px-4"
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                {unansweredCount} Remaining
                            </Button>
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Answer all {totalQuestions} questions to submit
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Submit Modal */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full p-8 shadow-2xl rounded-2xl">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Shield className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Submit Test?</h3>
                            <p className="text-gray-500 mt-3">
                                You have answered all <span className="font-bold text-gray-700">{totalQuestions}</span> questions.
                            </p>
                            <p className="text-sm text-gray-400 mt-1">Are you sure you want to submit?</p>
                            
                            {reviewCount > 0 && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <p className="text-sm text-yellow-700 flex items-center justify-center gap-2">
                                        <Flag className="h-4 w-4" />
                                        <span className="font-bold">{reviewCount}</span> questions marked for review
                                    </p>
                                </div>
                            )}
                            
                            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfirmSubmit(false)}
                                    className="w-full sm:w-auto px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmitTest}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Yes, Submit Now'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}