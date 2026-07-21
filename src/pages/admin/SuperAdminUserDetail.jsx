import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, Clock, CheckCircle, XCircle, Mail, Phone, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { userService } from '../../services/userService';

export default function SuperAdminUserDetail() {
    const { id } = useParams();

    // Fetch user details
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getById(id),
    });

    // Fetch user test results
    const { data: testResults, isLoading: resultsLoading } = useQuery({
        queryKey: ['user-tests', id],
        queryFn: () => userService.getTestResults(id),
    });

    if (userLoading || resultsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const getStatusBadge = (score, passingScore = 80) => {
        if (score >= passingScore) {
            return <Badge variant="success">Passed</Badge>;
        }
        return <Badge variant="danger">Failed</Badge>;
    };

    const totalTests = testResults?.length || 0;
    const passedTests = testResults?.filter(t => t.score >= 80).length || 0;
    const failedTests = testResults?.filter(t => t.score < 80).length || 0;
    const avgScore = totalTests > 0
        ? Math.round(testResults.reduce((acc, t) => acc + t.score, 0) / totalTests)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/super-admin/users" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-4 w-4" />
                            {user?.email}
                        </div>
                        {user?.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-4 w-4" />
                                {user?.phone}
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Joined {new Date(user?.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Tests</p>
                            <p className="text-2xl font-bold">{totalTests}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Passed</p>
                            <p className="text-2xl font-bold">{passedTests}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Failed</p>
                            <p className="text-2xl font-bold">{failedTests}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Award className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg Score</p>
                            <p className="text-2xl font-bold">{avgScore}%</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Test Results Table */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Test History</h2>

                {testResults?.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No test results available for this user</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Test Name</th>
                                    <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Category</th>
                                    <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Questions</th>
                                    <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Score</th>
                                    <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Status</th>
                                    <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testResults?.map((result) => (
                                    <tr key={result._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">{result.testName}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{result.category}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{result.totalQuestions}</td>
                                        <td className="py-3 px-4 text-sm font-medium">{result.score}%</td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(result.score, result.passingScore || 80)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(result.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}