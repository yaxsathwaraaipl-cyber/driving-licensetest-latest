import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, List, X, AlertCircle, CheckCircle, Globe, MapPin } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { testCategoryService } from '../../services/testCategoryService';
import { countryService } from '../../services/countryService';
import { provinceService } from '../../services/provinceService';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function TestCategoriesPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        countryId: '',
        provinceId: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const itemsPerPage = 10;

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setDebouncedSearchTerm(debouncedSearch);
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Fetch countries
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: countryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch provinces (when country is selected)
    const { data: provinces, refetch: refetchProvinces } = useQuery({
        queryKey: ['provinces', formData.countryId],
        queryFn: () => {
            if (formData.countryId) {
                return provinceService.getByCountry(formData.countryId);
            }
            return [];
        },
        enabled: !!formData.countryId,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch test categories
    const { data: categories, isLoading, refetch } = useQuery({
        queryKey: ['test-categories', debouncedSearchTerm],
        queryFn: async () => {
            let data = await testCategoryService.getAll();
            if (debouncedSearchTerm) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                data = data.filter(cat =>
                    cat.title?.toLowerCase().includes(searchLower) ||
                    cat.description?.toLowerCase().includes(searchLower)
                );
            }
            return data;
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: testCategoryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['test-categories']);
            setSuccess('Category created successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to create category');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => testCategoryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['test-categories']);
            setSuccess('Category updated successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to update category');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: testCategoryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['test-categories']);
            setSuccess('Category deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete category');
            setTimeout(() => setError(''), 3000);
        },
    });

    const openModal = (category = null) => {
        setError('');
        if (category) {
            setEditingCategory(category);
            setFormData({
                title: category.title || '',
                description: category.description || '',
                countryId: category.countryId?._id || category.countryId || '',
                provinceId: category.provinceId?._id || category.provinceId || '',
            });
        } else {
            setEditingCategory(null);
            setFormData({
                title: '',
                description: '',
                countryId: '',
                provinceId: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({
            title: '',
            description: '',
            countryId: '',
            provinceId: ''
        });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!formData.countryId) {
            setError('Please select a country');
            return;
        }
        if (!formData.provinceId) {
            setError('Please select a province');
            return;
        }

        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory._id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this test category?')) {
            deleteMutation.mutate(id);
        }
    };

    const getCountryName = (countryId) => {
        if (!countryId) return 'N/A';
        const country = countries?.find(c => c._id === countryId || c.id === countryId);
        return country?.name || 'N/A';
    };

    const getProvinceName = (provinceId) => {
        if (!provinceId) return 'N/A';
        const province = provinces?.find(p => p._id === provinceId || p.id === provinceId);
        return province?.name || 'N/A';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const totalPages = Math.ceil((categories?.length || 0) / itemsPerPage);
    const paginatedCategories = categories?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
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

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Test Categories</h1>
                    <p className="text-gray-500 mt-1">Manage test categories with country and province mapping</p>
                </div>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                />
            </div>

            {categories?.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No test categories found</h3>
                        <p className="text-gray-500 mt-2">Create your first test category to get started.</p>
                        <Button onClick={() => openModal()} className="mt-4">Add Category</Button>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedCategories?.map((category) => (
                            <Card key={category._id} className="p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <List className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                            <h3 className="font-semibold text-gray-900">{category.title}</h3>
                                        </div>
                                        {category.description && (
                                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                                        )}
                                        <div className="mt-2 space-y-1">
                                            {category.countryId && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    Country: {category.countryId.name || getCountryName(category.countryId)}
                                                </p>
                                            )}
                                            {category.provinceId && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    Province: {category.provinceId.name || getProvinceName(category.provinceId)}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={category.isActive ? 'success' : 'danger'} className="mt-2">
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={() => openModal(category)}
                                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, categories?.length || 0)} of {categories?.length || 0} categories
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

            {/* Modal - Create/Edit Category */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? 'Edit Test Category' : 'Add Test Category'}
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
                                    placeholder="Enter category title"
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
                                    placeholder="Enter category description"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        value={formData.countryId}
                                        onChange={(e) => {
                                            const countryId = e.target.value;
                                            setFormData({
                                                ...formData,
                                                countryId: countryId,
                                                provinceId: '' // Reset province when country changes
                                            });
                                            if (countryId) {
                                                refetchProvinces();
                                            }
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {countries?.map((country) => (
                                            <option key={country._id || country.id} value={country._id || country.id}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Province <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        value={formData.provinceId}
                                        onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                        disabled={!formData.countryId}
                                        required
                                    >
                                        <option value="">
                                            {!formData.countryId ? 'Select a country first' : 'Select Province'}
                                        </option>
                                        {provinces?.map((province) => (
                                            <option key={province._id || province.id} value={province._id || province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                        <>{editingCategory ? 'Update' : 'Create'} Category</>
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