import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Eye, Search, Filter, ChevronLeft, ChevronRight,
    BookOpen, X, AlertCircle, CheckCircle, Database, Image, FileText,
    List, Globe, MapPin, SquarePlus,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { questionBankService } from '../../services/questionBankService';
import { testCategoryService } from '../../services/testCategoryService';
import { useAuthStore } from '../../store/authStore';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function QuestionBanksPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ isActive: 'all' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', testCategoryId: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const itemsPerPage = 10;

    // ✅ Get admin's province ID
    const adminProvinceId = user?.provinceId?._id || user?.provinceId?.id || user?.provinceId;
    const adminCountryId = user?.countryId?._id || user?.countryId?.id || user?.countryId;

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setDebouncedSearchTerm(debouncedSearch);
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Fetch test categories
    const { data: testCategories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['test-categories'],
        queryFn: testCategoryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // ✅ Fetch question banks - FILTER BY ADMIN'S PROVINCE
    const { data: banks, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['question-banks', debouncedSearchTerm, filters, adminProvinceId],
        queryFn: async () => {
            console.log('🔄 Fetching question banks for admin province:', adminProvinceId);

            let allBanks = await questionBankService.getAll();
            console.log('📊 All question banks from API:', allBanks);

            // ✅ Filter by admin's province
            let filteredBanks = allBanks.filter(bank => {
                const bankProvinceId = bank.provinceId?._id || bank.provinceId ||
                    bank.province_id?.id || bank.province_id || '';

                // If bank has no province, include it (or exclude it based on your logic)
                if (!bankProvinceId) {
                    console.log('⚠️ Bank has no province:', bank.title);
                    return true; // Or return false if you want to exclude
                }

                const match = String(bankProvinceId) === String(adminProvinceId);
                if (match) {
                    console.log('✅ Bank matches admin province:', bank.title);
                }
                return match;
            });

            console.log('📊 Filtered banks for admin province:', filteredBanks);

            if (debouncedSearchTerm) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                filteredBanks = filteredBanks.filter(bank =>
                    bank.title?.toLowerCase().includes(searchLower) ||
                    bank.description?.toLowerCase().includes(searchLower)
                );
            }

            if (filters.isActive === 'active') {
                filteredBanks = filteredBanks.filter(bank => bank.isActive === true);
            } else if (filters.isActive === 'inactive') {
                filteredBanks = filteredBanks.filter(bank => bank.isActive === false);
            }

            return filteredBanks;
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: questionBankService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['question-banks']);
            setSuccess('Question bank created successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to create question bank');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => questionBankService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['question-banks']);
            setSuccess('Question bank updated successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to update question bank');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: questionBankService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['question-banks']);
            setSuccess('Question bank deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete question bank');
            setTimeout(() => setError(''), 3000);
        },
    });

    const openModal = (bank = null) => {
        setError('');
        if (bank) {
            setEditingBank(bank);
            setFormData({
                title: bank.title || '',
                description: bank.description || '',
                testCategoryId: bank.testCategoryId || '',
            });
        } else {
            setEditingBank(null);
            setFormData({ title: '', description: '', testCategoryId: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBank(null);
        setFormData({ title: '', description: '', testCategoryId: '' });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        // ✅ Include province and country when creating
        const submitData = {
            ...formData,
            provinceId: adminProvinceId,
            countryId: adminCountryId,
        };

        if (editingBank) {
            updateMutation.mutate({ id: editingBank._id, data: submitData });
        } else {
            createMutation.mutate(submitData);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this question bank? This will also delete all questions in it.')) {
            deleteMutation.mutate(id);
        }
    };

    const clearFilters = () => {
        setFilters({ isActive: 'all' });
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setCurrentPage(1);
    };

    const hasActiveFilters = () => searchTerm !== '' || filters.isActive !== 'all';

    // ✅ Improved function to get category details
    const getCategoryDetails = (categoryId) => {
        if (!categoryId) {
            return { name: 'No Category', color: 'text-gray-400' };
        }

        let actualId = categoryId;
        if (typeof categoryId === 'object' && categoryId !== null) {
            actualId = categoryId._id || categoryId.id || JSON.stringify(categoryId);
        }

        const searchId = String(actualId);

        let category = testCategories?.find(c => {
            const cId = String(c._id || c.id || '');
            return cId === searchId;
        });

        if (!category && searchId.length > 10) {
            category = testCategories?.find(c => {
                const cId = String(c._id || c.id || '');
                return cId.includes(searchId.substring(0, 10)) || searchId.includes(cId.substring(0, 10));
            });
        }

        if (category) {
            return {
                name: category.title || 'Unknown Category',
                color: 'text-blue-600',
                country: category.countryId?.name,
                province: category.provinceId?.name
            };
        }

        return {
            name: `Unknown Category`,
            color: 'text-orange-500'
        };
    };

    // Show loading state
    if (isLoading || categoriesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const totalPages = Math.ceil((banks?.length || 0) / itemsPerPage);
    const paginatedBanks = banks?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // ✅ Check if no banks available
    const hasNoBanks = !banks || banks.length === 0;

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

            {/* ✅ Info Banner - Show which province the admin is viewing */}
            {!hasNoBanks && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <p className="text-sm text-blue-700">
                        Showing question banks for <strong>{user?.provinceId?.name || 'your province'}</strong>
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Question Banks</h1>
                    <p className="text-gray-500 mt-1">Manage question banks and their questions</p>
                </div>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Bank
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search question banks..."
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
                                value={filters.isActive}
                                onChange={(e) => {
                                    setFilters({ ...filters, isActive: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
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

            {/* Active Filters Display */}
            {hasActiveFilters() && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            Search: "{searchTerm}"
                            <button onClick={() => { setSearchTerm(''); setDebouncedSearchTerm(''); setCurrentPage(1); }} className="hover:text-blue-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.isActive !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            Status: {filters.isActive}
                            <button onClick={() => setFilters({ ...filters, isActive: 'all' })} className="hover:text-blue-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* ✅ Banks List with No Banks Message */}
            {hasNoBanks ? (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Question Banks Available</h3>
                        <p className="text-gray-500 mt-2">
                            {adminProvinceId ? (
                                <>There are no question banks available for <strong>{user?.provinceId?.name || 'your province'}</strong>.</>
                            ) : (
                                <>No question banks have been created yet.</>
                            )}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            Create your first question bank to get started.
                        </p>
                        <Button onClick={() => openModal()} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Question Bank
                        </Button>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedBanks?.map((bank) => {
                            const categoryDetails = getCategoryDetails(bank.testCategoryId);
                            return (
                                <Card key={bank._id} className="p-5 hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                                    <h3 className="font-semibold text-gray-900 truncate">{bank.title}</h3>
                                                </div>
                                                {bank.description && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bank.description}</p>
                                                )}
                                                {bank.testCategoryId && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className={`text-xs flex items-center gap-1 ${categoryDetails.color}`}>
                                                            <List className="h-3 w-3" />
                                                            Category: {categoryDetails.name}
                                                        </p>
                                                        {categoryDetails.country && (
                                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                <Globe className="h-3 w-3" />
                                                                Country: {categoryDetails.country}
                                                            </p>
                                                        )}
                                                        {categoryDetails.province && (
                                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                Province: {categoryDetails.province}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                                <Link
                                                    to={`/admin/question-banks/${bank._id}`}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Questions"
                                                >
                                                    <SquarePlus className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => openModal(bank)}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit Bank"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bank._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-3 flex-wrap">
                                            <Badge variant="info" className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {bank.questions?.length || 0} Questions
                                            </Badge>
                                            {bank.questions?.some(q => q.questionImage) && (
                                                <Badge variant="success" className="flex items-center gap-1">
                                                    <Image className="h-3 w-3" />
                                                    Has Images
                                                </Badge>
                                            )}
                                            {bank.isActive ? (
                                                <Badge variant="success">Active</Badge>
                                            ) : (
                                                <Badge variant="danger">Inactive</Badge>
                                            )}
                                        </div>

                                        <div className="mt-3 text-xs text-gray-400">
                                            Created: {new Date(bank.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, banks?.length || 0)} of {banks?.length || 0} banks
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

            {/* Modal - Create/Edit Bank */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingBank ? 'Edit Question Bank' : 'Create Question Bank'}
                            </h2>
                            <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Enter bank title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all resize-none"
                                    placeholder="Enter bank description"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Test Category
                                </label>
                                <select
                                    value={formData.testCategoryId}
                                    onChange={(e) => setFormData({ ...formData, testCategoryId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                >
                                    <option value="">Select a test category</option>
                                    {testCategories?.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.title} {category.countryId?.name ? `(${category.countryId.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {testCategories?.length === 0 && 'No test categories available. Create one first.'}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    {(createMutation.isLoading || updateMutation.isLoading) ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>{editingBank ? 'Update' : 'Create'} Bank</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}