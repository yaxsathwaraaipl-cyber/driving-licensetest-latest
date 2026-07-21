import { useParams, Link } from 'react-router-dom';
import {
    Award,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ROUTES } from '../../constants';

// Mock data for a single result
const getMockResult = (id) => ({
    id: id,
    testName: 'Full Practice Test',
    score: 85,
    totalQuestions: 50,
    correctAnswers: 43,
    incorrectAnswers: 7,
    timeTaken: '45 min',
    date: '2024-01-15',
    status: 'passed',
    category: 'All Categories',
    questions: [
        { id: 1, question: 'What does a red traffic light mean?', yourAnswer: 'Stop', correctAnswer: 'Stop', isCorrect: true },
        { id: 2, question: 'When can you overtake on the right?', yourAnswer: 'When the vehicle ahead is turning left', correctAnswer: 'When the vehicle ahead is turning left', isCorrect: true },
        { id: 3, question: 'What is the speed limit in residential areas?', yourAnswer: '35 mph', correctAnswer: '25 mph', isCorrect: false },
        { id: 4, question: 'What does a yield sign mean?', yourAnswer: 'Slow down', correctAnswer: 'Slow down and give right of way', isCorrect: false },
        { id: 5, question: 'When should you use high beams?', yourAnswer: 'On dark roads with no traffic', correctAnswer: 'On dark roads with no traffic', isCorrect: true },
    ],
});

export default function ResultDetailPage() {
    const { id } = useParams();
    const result = getMockResult(id);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link to={ROUTES.RESULTS} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Results
            </Link>

            {/* Result Header */}
            <Card>
                <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.status === 'passed' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        {result.status === 'passed' ? (
                            <Award className="h-10 w-10 text-green-600" />
                        ) : (
                            <XCircle className="h-10 w-10 text-red-600" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{result.testName}</h1>
                    <p className="text-gray-500 mt-1">{result.category}</p>

                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-900">{result.score}%</p>
                            <p className="text-sm text-gray-500">Score</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-900">{result.correctAnswers}/{result.totalQuestions}</p>
                            <p className="text-sm text-gray-500">Correct</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-1">
                                <Clock className="h-6 w-6" />
                                {result.timeTaken}
                            </p>
                            <p className="text-sm text-gray-500">Duration</p>
                        </div>
                    </div>

                    <Badge
                        variant={result.status === 'passed' ? 'success' : 'danger'}
                        className="mt-4 text-sm px-4 py-1"
                    >
                        {result.status === 'passed' ? 'PASSED' : 'FAILED'}
                    </Badge>
                </div>
            </Card>

            {/* Question Review */}
            <Card>
                <CardHeader>
                    <CardTitle>Question Review</CardTitle>
                    <Badge variant="info">{result.questions.length} questions</Badge>
                </CardHeader>
                <div className="space-y-4">
                    {result.questions.map((q, index) => (
                        <div
                            key={q.id}
                            className={`p-4 rounded-lg border ${q.isCorrect
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-1.5 rounded-full flex-shrink-0 ${q.isCorrect ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    {q.isCorrect ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {index + 1}. {q.question}
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm">
                                            <span className="text-gray-500">Your answer: </span>
                                            <span className={q.isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                                {q.yourAnswer}
                                            </span>
                                        </p>
                                        {!q.isCorrect && (
                                            <p className="text-sm">
                                                <span className="text-gray-500">Correct answer: </span>
                                                <span className="text-green-700 font-medium">{q.correctAnswer}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
                <Link to={ROUTES.PRACTICE}>
                    <Button icon={BookOpen}>Take Another Test</Button>
                </Link>
                <Link to={ROUTES.RESULTS}>
                    <Button variant="secondary">All Results</Button>
                </Link>
            </div>
        </div>
    );
};