import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, UserCog, X, Globe, MapPin, CheckCircle, Ban, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';
import { countryService } from '../../services/countryService';
import { provinceService } from '../../services/provinceService';

// Debounce helper function
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function SuperAdminAdminsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        dateFrom: '',
        dateTo: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'admin',
        countryId: '',
        provinceId: '',
        isActive: false,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    // ✅ Fetch countries for dropdown
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: countryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // ✅ Fetch provinces based on selected country
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

    // Use debounce for search term (500ms delay)
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Update debounced search term
    useEffect(() => {
        setDebouncedSearchTerm(debouncedSearch);
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Fetch admins
    const { data: admins, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['admins', debouncedSearchTerm, filters],
        queryFn: async () => {
            console.log('🔄 Fetching admins, search term:', debouncedSearchTerm);

            let data = await adminService.getAll();
            console.log('📊 All admins from API:', data);

            // ✅ Ensure we only show admins (role: 'admin')
            data = data.filter(admin => admin.role === 'admin');
            console.log('🔽 Filtered to only show admins:', data);

            // Apply search filter (using debounced search term)
            if (debouncedSearchTerm) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                data = data.filter(admin =>
                    admin.fullName?.toLowerCase().includes(searchLower) ||
                    admin.email?.toLowerCase().includes(searchLower) ||
                    admin.phone?.includes(debouncedSearchTerm)
                );
            }

            // Apply status filter
            if (filters.status === 'active') {
                data = data.filter(admin => admin.isActive === true);
            } else if (filters.status === 'inactive') {
                data = data.filter(admin => admin.isActive === false);
            }

            // Apply date range filter
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                data = data.filter(admin => new Date(admin.createdAt) >= fromDate);
            }
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59);
                data = data.filter(admin => new Date(admin.createdAt) <= toDate);
            }

            console.log('✅ Final filtered admins:', data);
            return data;
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 0,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: adminService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
            setSuccess('Admin created successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to create admin');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
            setSuccess('Admin updated successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to update admin');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: adminService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
            setSuccess('Admin deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete admin');
            setTimeout(() => setError(''), 3000);
        },
    });

    // ✅ Toggle admin status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: async (id) => {
            // First get the current admin data
            const response = await adminService.getById(id);
            const admin = response?.data || response;
            console.log('Current admin data:', admin);
            console.log('Current isActive:', admin.isActive);

            // Toggle the isActive status
            const updatedData = {
                ...admin,
                isActive: !admin.isActive
            };
            console.log('Updated data:', updatedData);
            console.log('New isActive:', updatedData.isActive);

            // Update using the update endpoint
            const result = await adminService.update(id, updatedData);
            console.log('Update result:', result);
            return result;
        },
        onSuccess: () => {
            // ✅ Invalidate and refetch to update the list
            queryClient.invalidateQueries(['admins']);
            // ✅ Force refetch to get fresh data
            refetch();
            setSuccess('Admin status updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            console.error('Toggle status error:', error);
            setError(error.response?.data?.message || 'Failed to update admin status');
            setTimeout(() => setError(''), 3000);
        },
    });

    const openModal = (admin = null) => {
        setError('');
        setSuccess('');
        if (admin) {
            setEditingAdmin(admin);

            // ✅ Extract country and province IDs from admin data
            let countryId = '';
            let provinceId = '';

            // Handle countryId - could be object with id field
            if (admin.countryId) {
                if (typeof admin.countryId === 'object') {
                    countryId = admin.countryId.id || admin.countryId._id || '';
                } else {
                    countryId = admin.countryId;
                }
            }

            // Handle provinceId - could be object with id field
            if (admin.provinceId) {
                if (typeof admin.provinceId === 'object') {
                    provinceId = admin.provinceId.id || admin.provinceId._id || '';
                } else {
                    provinceId = admin.provinceId;
                }
            }

            setFormData({
                fullName: admin.fullName || '',
                email: admin.email || '',
                phone: admin.phone || '',
                password: '',
                role: admin.role || 'admin',
                countryId: countryId,
                provinceId: provinceId,
                isActive: admin.isActive || false,
            });
        } else {
            setEditingAdmin(null);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                role: 'admin',
                countryId: '',
                provinceId: '',
                isActive: false,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAdmin(null);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            password: '',
            role: 'admin',
            countryId: '',
            provinceId: '',
            isActive: false,
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.fullName.trim()) {
            setError('Full name is required');
            return;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return;
        }

        // ✅ Prepare data with country, province, and isActive
        const submitData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone || '',
            role: 'admin',
            countryId: formData.countryId || '',
            provinceId: formData.provinceId || '',
            isActive: formData.isActive || false,
        };

        if (editingAdmin) {
            // Only include password if provided
            if (formData.password) {
                submitData.password = formData.password;
            }
            updateMutation.mutate({
                id: editingAdmin._id || editingAdmin.id,
                data: submitData,
            });
        } else {
            if (!formData.password) {
                setError('Password is required for new admin');
                return;
            }
            submitData.password = formData.password;
            createMutation.mutate(submitData);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            deleteMutation.mutate(id);
        }
    };

    // ✅ Handle toggle status
    const handleToggleStatus = async (id) => {
        if (window.confirm('Are you sure you want to toggle this admin\'s status?')) {
            try {
                await toggleStatusMutation.mutateAsync(id);
            } catch (err) {
                console.error('Error toggling status:', err);
            }
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive
            ? <Badge variant="success">Active</Badge>
            : <Badge variant="danger">Inactive</Badge>;
    };

    // ✅ Get country name from ID - handles object with id field
    const getCountryName = (countryId) => {
        if (!countryId) return 'N/A';

        // If it's an object with name (from API response)
        if (typeof countryId === 'object' && countryId.name) {
            return countryId.name;
        }

        // If it's an object with _id or id
        if (typeof countryId === 'object') {
            const id = countryId.id || countryId._id || '';
            const country = countries?.find(c => {
                const cId = c.id || c._id;
                return String(cId) === String(id);
            });
            return country?.name || 'N/A';
        }

        // If it's a string ID
        const country = countries?.find(c => {
            const cId = c.id || c._id;
            return String(cId) === String(countryId);
        });
        return country?.name || 'N/A';
    };

    // ✅ Get province name from ID - handles object with id field
    const getProvinceName = (provinceId) => {
        if (!provinceId) return 'N/A';

        // If it's an object with name (from API response)
        if (typeof provinceId === 'object' && provinceId.name) {
            return provinceId.name;
        }

        // If it's an object with _id or id
        if (typeof provinceId === 'object') {
            const id = provinceId.id || provinceId._id || '';
            const province = provinces?.find(p => {
                const pId = p.id || p._id;
                return String(pId) === String(id);
            });
            return province?.name || 'N/A';
        }

        // If it's a string ID
        const province = provinces?.find(p => {
            const pId = p.id || p._id;
            return String(pId) === String(provinceId);
        });
        return province?.name || 'N/A';
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            dateFrom: '',
            dateTo: '',
        });
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setCurrentPage(1);
    };

    const hasActiveFilters = () => {
        return searchTerm !== '' ||
            filters.status !== 'all' ||
            filters.dateFrom !== '' ||
            filters.dateTo !== '';
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // ✅ Handle country change - reset province
    const handleCountryChange = (e) => {
        const countryId = e.target.value;
        setFormData({
            ...formData,
            countryId: countryId,
            provinceId: '', // Reset province when country changes
        });
        if (countryId) {
            refetchProvinces();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    // Pagination
    const totalPages = Math.ceil((admins?.length || 0) / itemsPerPage);
    const paginatedAdmins = admins?.slice(
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
                    <p className="text-gray-500 mt-1">Add, edit, or remove administrators</p>
                </div>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Admin
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search admins..."
                        value={searchTerm}
                        onChange={handleSearchChange}
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-500"
                    >
                        Clear All
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="flex items-center gap-1"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => {
                                    setFilters({ ...filters, dateFrom: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => {
                                    setFilters({ ...filters, dateTo: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(false)}
                        >
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
                            <button onClick={() => {
                                setSearchTerm('');
                                setDebouncedSearchTerm('');
                                setCurrentPage(1);
                            }} className="hover:text-blue-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.status !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            Status: {filters.status}
                            <button onClick={() => setFilters({ ...filters, status: 'all' })} className="hover:text-blue-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.dateFrom && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            From: {filters.dateFrom}
                            <button onClick={() => setFilters({ ...filters, dateFrom: '' })} className="hover:text-blue-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.dateTo && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            To: {filters.dateTo}
                            <button onClick={() => setFilters({ ...filters, dateTo: '' })} className="hover:text-blue-900">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Admin List */}
            {admins?.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No admins found</h3>
                        <p className="text-gray-500 mt-2">Create your first admin to get started.</p>
                        <Button onClick={() => openModal()} className="mt-4">
                            Create Admin
                        </Button>
                    </div>
                </Card>
            ) : (
                <>
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Admin</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Email</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Phone</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Country</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Province</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Status</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Joined</th>
                                        <th className="text-center text-sm font-medium text-gray-500 py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedAdmins?.map((admin) => {
                                        // ✅ Get country and province names
                                        const countryName = getCountryName(admin.countryId);
                                        const provinceName = getProvinceName(admin.provinceId);

                                        return (
                                            <tr key={admin._id || admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-purple-700">
                                                                {admin.fullName?.charAt(0) || 'A'}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {admin.fullName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{admin.email}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{admin.phone || '-'}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Globe className="h-3 w-3 text-gray-400" />
                                                        {countryName}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-gray-400" />
                                                        {provinceName}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{getStatusBadge(admin.isActive)}</td>
                                                <td className="py-3 px-4 text-sm text-gray-500">
                                                    {new Date(admin.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openModal(admin)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(admin._id || admin.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${admin.isActive
                                                                    ? 'text-red-600 hover:bg-red-50'
                                                                    : 'text-green-600 hover:bg-green-50'
                                                                }`}
                                                            title={admin.isActive ? 'Deactivate' : 'Activate'}
                                                            disabled={toggleStatusMutation.isLoading}
                                                        >
                                                            {toggleStatusMutation.isLoading ? (
                                                                <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                            ) : admin.isActive ? (
                                                                <Ban className="h-4 w-4" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(admin._id || admin.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, admins?.length || 0)} of {admins?.length || 0} admins
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

            {/* Modal - Add/Edit Admin */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingAdmin ? 'Edit Admin' : 'Add Admin'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
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
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {/* Country Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        value={formData.countryId}
                                        onChange={handleCountryChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    >
                                        <option value="">Select Country</option>
                                        {countries?.map((country) => {
                                            const countryId = country.id || country._id;
                                            return (
                                                <option key={countryId} value={countryId}>
                                                    {country.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* Province Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Province / State
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
                                    >
                                        <option value="">
                                            {!formData.countryId ? 'Select a country first' : 'Select Province'}
                                        </option>
                                        {provinces?.map((province) => {
                                            const provinceId = province.id || province._id;
                                            return (
                                                <option key={provinceId} value={provinceId}>
                                                    {province.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {editingAdmin ? 'New Password (optional)' : 'Password *'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder={editingAdmin ? 'Leave blank to keep current' : 'Enter password'}
                                    required={!editingAdmin}
                                />
                            </div>

                            {editingAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formData.isActive === true}
                                                onChange={() => setFormData({ ...formData, isActive: true })}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formData.isActive === false}
                                                onChange={() => setFormData({ ...formData, isActive: false })}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Inactive</span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Admins are inactive by default until activated by Super Admin</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                    className="flex-1"
                                >
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
                                        <>{editingAdmin ? 'Update' : 'Create'} Admin</>
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