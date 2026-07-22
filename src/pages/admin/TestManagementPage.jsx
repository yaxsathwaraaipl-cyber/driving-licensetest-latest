import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight,
    FileText, X, AlertCircle, CheckCircle, Eye, Play, BarChart3,
    Globe, MapPin, Clock, BookOpen
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { testService } from '../../services/testService';
import { useAuthStore } from '../../store/authStore';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function TestManagementPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        isPublished: 'all',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const itemsPerPage = 10;

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setDebouncedSearchTerm(debouncedSearch);
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Get user's province for filtering
    const userProvinceId = user?.provinceId?._id || user?.provinceId?.id || user?.provinceId;

    // Fetch tests
    const { data: tests, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['tests', debouncedSearchTerm, filters, userProvinceId],
        queryFn: async () => {
            // Admin sees tests for their province
            const params = {};
            if (userProvinceId) {
                params.provinceId = userProvinceId;
            }
            if (filters.isPublished === 'published') {
                params.isPublished = true;
            } else if (filters.isPublished === 'draft') {
                params.isPublished = false;
            }

            let allTests = await testService.getAll(params);

            if (debouncedSearchTerm) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                allTests = allTests.filter(test =>
                    test.title?.toLowerCase().includes(searchLower) ||
                    test.description?.toLowerCase().includes(searchLower)
                );
            }

            // Apply status filter
            if (filters.status === 'active') {
                allTests = allTests.filter(test => test.isActive === true);
            } else if (filters.status === 'inactive') {
                allTests = allTests.filter(test => test.isActive === false);
            }

            return allTests;
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: testService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['tests']);
            setSuccess('Test deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete test');
            setTimeout(() => setError(''), 3000);
        },
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this test?')) {
            deleteMutation.mutate(id);
        }
    };

    const clearFilters = () => {
        setFilters({ status: 'all', isPublished: 'all' });
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setCurrentPage(1);
    };

    const hasActiveFilters = () => {
        return searchTerm !== '' || filters.status !== 'all' || filters.isPublished !== 'all';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const totalPages = Math.ceil((tests?.length || 0) / itemsPerPage);
    const paginatedTests = tests?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
                    <p className="text-gray-500 mt-1">Create and manage driving tests</p>
                </div>
                <Link to="/admin/tests/create">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Test
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                    {isFetching && searchTerm !== debouncedSearchTerm && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
                <Button
                    variant={hasActiveFilters() ? "primary" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters() && (
                        <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                    )}
                </Button>
                {hasActiveFilters() && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                        Clear All
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => {
                                    setFilters({ ...filters, status: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Published Status</label>
                            <select
                                value={filters.isPublished}
                                onChange={(e) => {
                                    setFilters({ ...filters, isPublished: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            >
                                <option value="all">All</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                            Close Filters
                        </Button>
                    </div>
                </Card>
            )}

            {/* Tests List */}
           {/* Tests List */}
{tests?.length === 0 ? (
    <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No tests found</h3>
            <p className="text-gray-500 mt-2">Create your first test to get started.</p>
            <Link to="/admin/tests/create">
                <Button className="mt-4">Create Test</Button>
            </Link>
        </div>
    </Card>
) : (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTests?.map((test) => {
                // ✅ Get the correct ID
                const testId = test._id || test.id;
                
                return (
                    <Card key={testId} className="p-5 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                        <h3 className="font-semibold text-gray-900 truncate">{test.title}</h3>
                                    </div>
                                    {test.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{test.description}</p>
                                    )}
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            {test.countryId?.name || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {test.provinceId?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 ml-2">
                                    {test.isPublished ? (
                                        <Badge variant="success">Published</Badge>
                                    ) : (
                                        <Badge variant="warning">Draft</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <Badge variant="info" className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {test.totalQuestions || 0} Q
                                </Badge>
                                <Badge variant="primary" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {test.categories?.reduce((acc, cat) => acc + (cat.timer || 0), 0) || 0} min
                                </Badge>
                                <Badge variant={test.isActive ? 'success' : 'danger'}>
                                    {test.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                {/* ✅ Fixed: use testId */}
                                <Link to={`/admin/tests/${testId}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                    </Button>
                                </Link>
                                {/* ✅ Fixed: use testId */}
                                <Link to={`/admin/tests/${testId}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(testId)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-2 text-xs text-gray-400">
                                Created: {new Date(test.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>

        {/* Pagination - unchanged */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, tests?.length || 0)} of {tests?.length || 0} tests
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
    </>
)}
        </div>
    );
}