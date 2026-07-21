import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight,
    AlertCircle, CheckCircle, Image as ImageIcon, FileText, X,
    MapPin, List, Globe
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { trafficSignService } from '../../services/trafficSignService';
import { categoryService } from '../../services/categoryService';
import { provinceService } from '../../services/provinceService';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function TrafficSignsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        categoryId: '',
        provinceId: '',
    });
    const [error, setError] = useState('');
    const itemsPerPage = 10;

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setDebouncedSearchTerm(debouncedSearch);
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Fetch categories for filter
    const { data: categories } = useQuery({
        queryKey: ['traffic-categories'],
        queryFn: categoryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch provinces for filter
    const { data: provinces } = useQuery({
        queryKey: ['provinces-all'],
        queryFn: provinceService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch traffic signs
    const { data: signs, isLoading, refetch, isFetching, error: queryError } = useQuery({
        queryKey: ['traffic-signs', debouncedSearchTerm, filters],
        queryFn: async () => {
            try {
                let allSigns = [];

                // If province filter is applied, use the province-specific endpoint
                if (filters.provinceId) {
                    allSigns = await trafficSignService.getByProvince(filters.provinceId);
                } else {
                    allSigns = await trafficSignService.getAll();
                }

                console.log('All signs received:', allSigns);

                if (!Array.isArray(allSigns)) {
                    allSigns = [];
                }

                if (debouncedSearchTerm) {
                    const searchLower = debouncedSearchTerm.toLowerCase();
                    allSigns = allSigns.filter(sign =>
                        sign.title?.toLowerCase().includes(searchLower) ||
                        sign.description?.toLowerCase().includes(searchLower)
                    );
                }

                if (filters.categoryId) {
                    allSigns = allSigns.filter(sign => {
                        const categoryId = sign.categoryId?._id || sign.categoryId || '';
                        return String(categoryId) === String(filters.categoryId);
                    });
                }

                return allSigns;
            } catch (err) {
                console.error('Error in queryFn:', err);
                setError(err.message);
                return [];
            }
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 0,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: trafficSignService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['traffic-signs']);
            queryClient.invalidateQueries(['traffic-sign']);
            refetch();
        },
        onError: (error) => {
            console.error('Failed to delete traffic sign:', error);
            setError('Failed to delete traffic sign');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Toggle status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: trafficSignService.toggleStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(['traffic-signs']);
            queryClient.invalidateQueries(['traffic-sign']);
            refetch();
        },
        onError: (error) => {
            console.error('Failed to toggle status:', error);
            setError('Failed to toggle status');
            setTimeout(() => setError(''), 3000);
        },
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this traffic sign?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleToggleStatus = (id) => {
        toggleStatusMutation.mutate(id);
    };

    const clearFilters = () => {
        setFilters({ categoryId: '', provinceId: '' });
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setCurrentPage(1);
    };

    const hasActiveFilters = () => {
        return searchTerm !== '' || filters.categoryId !== '' || filters.provinceId !== '';
    };

    // ✅ Fix: Get category name - handles both string and object
    const getCategoryName = (category) => {
        if (!category) return 'N/A';
        if (typeof category === 'object') {
            return category.name || 'N/A';
        }
        // If it's a string ID, look it up
        const found = categories?.find(c => String(c._id) === String(category));
        return found?.name || 'N/A';
    };

    // ✅ Fix: Get province names - handles array of objects
    const getProvinceNames = (provinceIds) => {
        if (!provinceIds || provinceIds.length === 0) return 'N/A';

        const names = provinceIds.map(province => {
            if (typeof province === 'object') {
                return province.name || 'Unknown';
            }
            // If it's a string ID, look it up
            const found = provinces?.find(p => String(p._id) === String(province));
            return found?.name || 'Unknown';
        });

        return names.join(', ');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (queryError || error) {
        return (
            <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Error loading traffic signs</h3>
                    <p className="text-gray-500 mt-2">{queryError?.message || error || 'Please try again later.'}</p>
                    <Button onClick={() => refetch()} className="mt-4">
                        Retry
                    </Button>
                </div>
            </Card>
        );
    }

    const totalPages = Math.ceil((signs?.length || 0) / itemsPerPage);
    const paginatedSigns = signs?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Traffic Signs</h1>
                    <p className="text-gray-500 mt-1">Manage traffic signs for the system</p>
                </div>
                <Link to="/admin/traffic-signs/create">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Traffic Sign
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search traffic signs..."
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={filters.categoryId}
                                onChange={(e) => {
                                    setFilters({ ...filters, categoryId: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            >
                                <option value="">All Categories</option>
                                {categories?.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                            <select
                                value={filters.provinceId}
                                onChange={(e) => {
                                    setFilters({ ...filters, provinceId: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            >
                                <option value="">All Provinces</option>
                                {provinces?.map((province) => (
                                    <option key={province._id} value={province._id}>
                                        {province.name}
                                    </option>
                                ))}
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
                    {filters.categoryId && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            Category: {getCategoryName(filters.categoryId)}
                            <button onClick={() => setFilters({ ...filters, categoryId: '' })} className="hover:text-blue-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.provinceId && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            Province: {getProvinceNames([filters.provinceId])}
                            <button onClick={() => setFilters({ ...filters, provinceId: '' })} className="hover:text-blue-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Signs List */}
            {signs?.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No traffic signs found</h3>
                        <p className="text-gray-500 mt-2">Create your first traffic sign to get started.</p>
                        <Link to="/admin/traffic-signs/create">
                            <Button className="mt-4">Add Traffic Sign</Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedSigns?.map((sign) => {
                            const categoryName = getCategoryName(sign.categoryId);
                            const provinceNames = getProvinceNames(sign.provinceIds);

                            return (
                                <Card key={sign._id} className="p-5 hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {sign.image ? (
                                                        <img
                                                            src={sign.image}
                                                            alt={sign.title}
                                                            className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                                                        />
                                                    ) : (
                                                        <FileText className="h-10 w-10 text-gray-400" />
                                                    )}
                                                    <h3 className="font-semibold text-gray-900 truncate">{sign.title}</h3>
                                                </div>
                                                {sign.description && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sign.description}</p>
                                                )}
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <List className="h-3 w-3" />
                                                        Category: {categoryName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        Provinces: {provinceNames}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 ml-2">
                                                <button
                                                    onClick={() => handleToggleStatus(sign._id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${sign.isActive
                                                            ? 'text-green-600 hover:bg-green-50'
                                                            : 'text-gray-400 hover:bg-gray-50'
                                                        }`}
                                                    title={sign.isActive ? 'Active' : 'Inactive'}
                                                >
                                                    <Badge variant={sign.isActive ? 'success' : 'danger'}>
                                                        {sign.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                            <Link
                                                to={`/admin/traffic-signs/${sign._id}/edit`}
                                                className="flex-1"
                                            >
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(sign._id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-2 text-xs text-gray-400">
                                            Created: {new Date(sign.createdAt).toLocaleDateString()}
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
                                {Math.min(currentPage * itemsPerPage, signs?.length || 0)} of {signs?.length || 0} signs
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