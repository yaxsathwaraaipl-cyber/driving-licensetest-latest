import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Award,
    BookOpen,
    CheckCircle,
    XCircle,
    TrendingUp,
    Clock,
    Download,
    Eye,
    Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { ROUTES } from '../../constants';

const mockResults = [
    {
        id: 1,
        testName: 'Full Practice Test',
        score: 85,
        totalQuestions: 50,
        correctAnswers: 43,
        incorrectAnswers: 7,
        timeTaken: '45 min',
        date: '2024-01-15',
        status: 'passed',
        category: 'All Categories',
    },
    {
        id: 2,
        testName: 'Road Signs Quiz',
        score: 90,
        totalQuestions: 20,
        correctAnswers: 18,
        incorrectAnswers: 2,
        timeTaken: '18 min',
        date: '2024-01-14',
        status: 'passed',
        category: 'Road Signs',
    },
    {
        id: 3,
        testName: 'Traffic Rules Test',
        score: 65,
        totalQuestions: 30,
        correctAnswers: 20,
        incorrectAnswers: 10,
        timeTaken: '28 min',
        date: '2024-01-13',
        status: 'failed',
        category: 'Traffic Rules',
    },
    {
        id: 4,
        testName: 'Parking Practice',
        score: 80,
        totalQuestions: 15,
        correctAnswers: 12,
        incorrectAnswers: 3,
        timeTaken: '12 min',
        date: '2024-01-12',
        status: 'passed',
        category: 'Parking',
    },
    {
        id: 5,
        testName: 'Emergency Procedures',
        score: 75,
        totalQuestions: 25,
        correctAnswers: 19,
        incorrectAnswers: 6,
        timeTaken: '22 min',
        date: '2024-01-10',
        status: 'passed',
        category: 'Emergency',
    },
    {
        id: 6,
        testName: 'Safe Driving Practice',
        score: 70,
        totalQuestions: 30,
        correctAnswers: 21,
        incorrectAnswers: 9,
        timeTaken: '25 min',
        date: '2024-01-08',
        status: 'passed',
        category: 'Safe Driving',
    },
];

export default function ResultsPage() {
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    const filteredResults = mockResults
        .filter(r => filter === 'all' ? true : r.status === filter)
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'score') return b.score - a.score;
            return 0;
        });

    const stats = {
        totalTests: mockResults.length,
        passedTests: mockResults.filter(r => r.status === 'passed').length,
        failedTests: mockResults.filter(r => r.status === 'failed').length,
        averageScore: Math.round(mockResults.reduce((acc, r) => acc + r.score, 0) / mockResults.length),
        bestScore: Math.max(...mockResults.map(r => r.score)),
        totalQuestions: mockResults.reduce((acc, r) => acc + r.totalQuestions, 0),
        totalCorrect: mockResults.reduce((acc, r) => acc + r.correctAnswers, 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
                    <p className="text-gray-500 mt-1">View your test performance history</p>
                </div>
                <Link to={ROUTES.PRACTICE}>
                    <Button icon={BookOpen}>Take New Test</Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tests', value: stats.totalTests, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Passed', value: stats.passedTests, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'Average Score', value: `${stats.averageScore}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Best Score', value: `${stats.bestScore}%`, icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Overview</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Overall Accuracy</span>
                                <span className="font-medium text-gray-900">
                                    {Math.round((stats.totalCorrect / stats.totalQuestions) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${Math.round((stats.totalCorrect / stats.totalQuestions) * 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Pass Rate</span>
                                <span className="font-medium text-gray-900">
                                    {Math.round((stats.passedTests / stats.totalTests) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full"
                                    style={{ width: `${Math.round((stats.passedTests / stats.totalTests) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500">Total Questions</p>
                            <p className="text-lg font-bold text-gray-900">{stats.totalQuestions}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-500">Correct Answers</p>
                            <p className="text-lg font-bold text-gray-900">{stats.totalCorrect}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-xs text-gray-500">Failed Tests</p>
                            <p className="text-lg font-bold text-gray-900">{stats.failedTests}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-gray-500">Best Score</p>
                            <p className="text-lg font-bold text-gray-900">{stats.bestScore}%</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Tests' },
                        { value: 'passed', label: 'Passed Only' },
                        { value: 'failed', label: 'Failed Only' },
                    ]}
                    className="w-48"
                />
                <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                        { value: 'date', label: 'Sort by Date' },
                        { value: 'score', label: 'Sort by Score' },
                    ]}
                    className="w-48"
                />
                <Button variant="ghost" size="sm" icon={Download} className="ml-auto">
                    Export Results
                </Button>
            </div>

            {/* Results List */}
            {filteredResults.length === 0 ? (
                <EmptyState
                    icon="file"
                    title="No results found"
                    description={filter !== 'all' ? `No ${filter} tests found. Try changing the filter.` : 'You haven\'t taken any tests yet. Start practicing!'}
                    actionLabel={filter === 'all' ? 'Start Practice' : undefined}
                    onAction={filter === 'all' ? () => { } : undefined}
                />
            ) : (
                <div className="space-y-4">
                    {filteredResults.map((result) => (
                        <Card key={result.id} className="p-5 hover:shadow-md transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg flex-shrink-0 ${result.status === 'passed' ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                        {result.status === 'passed' ? (
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-600" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900">{result.testName}</h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                            <Badge variant="info" className="text-xs">{result.category}</Badge>
                                            <span className="text-sm text-gray-500">{result.totalQuestions} questions</span>
                                            <span className="text-gray-300 hidden sm:inline">•</span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {result.timeTaken}
                                            </span>
                                            <span className="text-gray-300 hidden sm:inline">•</span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(result.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 lg:gap-6">
                                    <div className="text-center">
                                        <p className={`text-2xl font-bold ${result.score >= 80 ? 'text-green-600' :
                                                result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {result.score}%
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {result.correctAnswers}/{result.totalQuestions} correct
                                        </p>
                                    </div>

                                    <Badge
                                        variant={result.status === 'passed' ? 'success' : 'danger'}
                                        className="text-sm px-3 py-1"
                                    >
                                        {result.status === 'passed' ? 'PASSED' : 'FAILED'}
                                    </Badge>

                                    <Link to={`/results/${result.id}`}>
                                        <Button variant="ghost" size="sm" icon={Eye}>
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Score Bar */}
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full ${result.score >= 80 ? 'bg-green-500' :
                                            result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${result.score}%` }}
                                />
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};