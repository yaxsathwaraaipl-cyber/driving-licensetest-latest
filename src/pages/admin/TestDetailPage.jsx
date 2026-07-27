import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, Trash2, Eye, FileText, BookOpen, Clock,
    Users, TrendingUp, CheckCircle, XCircle, BarChart3,
    Globe, MapPin, AlertCircle, ChevronLeft, ChevronRight,
    Calendar, Award, PieChart, Activity
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { testService } from '../../services/testService';

export default function TestDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const itemsPerPage = 10;

    // Fetch test details
    const { data: test, isLoading } = useQuery({
        queryKey: ['test', id],
        queryFn: () => testService.getById(id),
        retry: 2,
        retryDelay: 1000,
    });

    // Fetch test analytics
    const { data: analytics } = useQuery({
        queryKey: ['test-analytics', id],
        queryFn: () => testService.getAnalytics(id),
        retry: 2,
        retryDelay: 1000,
        enabled: !!id,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: testService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['tests']);
            setSuccess('Test deleted successfully!');
            setTimeout(() => navigate('/admin/tests'), 1500);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete test');
            setTimeout(() => setError(''), 3000);
        },
    });

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this test? This will also delete all attempts.')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!test) {
        return (
            <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Test not found</h3>
                    <Button onClick={() => navigate('/admin/tests')} className="mt-4">Go Back</Button>
                </div>
            </Card>
        );
    }

    // Calculate total questions and marks
    const totalQuestions = test.categories?.reduce((acc, cat) => acc + (cat.numberOfQuestions || 0), 0) || 0;
    const totalMarks = totalQuestions; // Assuming 1 mark per question

    // Get attempts from analytics
    const attempts = analytics?.topScores || [];
    const totalAttempts = analytics?.totalAttempts || 0;
    const passRate = analytics?.passRate || 0;
    const averageScore = analytics?.averageScore || 0;
    const averageTime = analytics?.averageTime || 0;

    // Pagination for attempts
    const totalPages = Math.ceil(attempts.length / itemsPerPage);
    const paginatedAttempts = attempts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            {/* Success/Error Messages */}
            {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-700">{success}</p>
                </div>
            )}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/tests" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant={test.isPublished ? 'success' : 'warning'}>
                                {test.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                            <Badge variant={test.isActive ? 'success' : 'danger'}>
                                {test.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="info" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {totalQuestions} Questions
                            </Badge>
                            <Badge variant="primary" className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {test.passingScore}% Passing
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/admin/tests/${id}/edit`}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Test Details Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Details</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-gray-900">{test.description || 'No description provided'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Country</p>
                                    <p className="text-gray-900 flex items-center gap-1">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        {test.countryId?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Province</p>
                                    <p className="text-gray-900 flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {test.provinceId?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Total Questions</p>
                                    <p className="text-gray-900 font-medium">{totalQuestions}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Marks</p>
                                    <p className="text-gray-900 font-medium">{totalMarks}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Passing Score</p>
                                    <p className="text-gray-900 font-medium">{test.passingScore}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Show Answers After Submission</p>
                                    <p className="text-gray-900">{test.showAnswersAfterSubmission ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created At</p>
                                <p className="text-gray-900">{new Date(test.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Categories Card */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                        {test.categories?.length === 0 ? (
                            <p className="text-gray-500">No categories added.</p>
                        ) : (
                            <div className="space-y-3">
                                {test.categories?.map((cat, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {cat.categoryId?.title || cat.categoryId || 'Unknown Category'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Question Bank: {cat.questionBankId?.title || 'Unknown'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="info" className="flex items-center gap-1">
                                                    <BookOpen className="h-3 w-3" />
                                                    {cat.numberOfQuestions || 0} Q
                                                </Badge>
                                                <Badge variant="primary" className="flex items-center gap-1 mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    {cat.timer || 0} min
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column - Analytics */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm text-gray-600">Total Attempts</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{totalAttempts}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    <span className="text-sm text-gray-600">Pass Rate</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">{passRate}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-amber-500" />
                                    <span className="text-sm text-gray-600">Average Score</span>
                                </div>
                                <span className="text-lg font-bold text-amber-600">{averageScore}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-purple-500" />
                                    <span className="text-sm text-gray-600">Average Time</span>
                                </div>
                                <span className="text-lg font-bold text-purple-600">{averageTime}s</span>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link to={`/admin/tests/${id}/edit`}>
                                <Button variant="outline" className="w-full justify-start">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Test
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full justify-start" >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Detailed Analytics
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Attempts History */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Attempts</h2>
                    <span className="text-sm text-gray-500">Total: {totalAttempts} attempts</span>
                </div>

                {attempts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No attempts yet for this test.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">User</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Score</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Time Taken</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Result</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedAttempts.map((attempt, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                {attempt.userId?.fullName || 'Unknown User'}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium">
                                                {attempt.percentage}%
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {attempt.timeTaken}s
                                            </td>
                                            <td className="py-3 px-4">
                                                {attempt.percentage >= (test.passingScore || 70) ? (
                                                    <Badge variant="success" className="flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Passed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="danger" className="flex items-center gap-1">
                                                        <XCircle className="h-3 w-3" />
                                                        Failed
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {new Date(attempt.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-gray-500">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                    {Math.min(currentPage * itemsPerPage, attempts.length)} of {attempts.length} attempts
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
}