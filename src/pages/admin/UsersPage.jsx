import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight,
    User, X, AlertCircle, Eye, Ban, CheckCircle, UserPlus, Mail, Phone, Lock, Save
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';

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

export default function UsersPage() {
    const { user: currentUser } = useAuthStore();
    const location = useLocation();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        role: 'all',
        dateFrom: '',
        dateTo: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const itemsPerPage = 10;

    // Check if user is Super Admin
    const isSuperAdmin = currentUser?.role === 'super_admin';

    // Use debounce for search term (500ms delay)
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Update debounced search term
    useEffect(() => {
        setDebouncedSearchTerm(debouncedSearch);
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Fetch users
    const { data: users, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['users', debouncedSearchTerm, filters, isSuperAdmin],
        queryFn: async () => {
            console.log('🔄 Fetching users, isSuperAdmin:', isSuperAdmin);

            try {
                const allUsers = await userService.getAll();
                console.log('📊 All users from API:', allUsers);

                let data = Array.isArray(allUsers) ? allUsers : [];

                // Filter to show ONLY regular users (role: 'user')
                data = data.filter(user => user.role === 'user');

                // Apply search filter (using debounced search term)
                if (debouncedSearchTerm) {
                    const searchLower = debouncedSearchTerm.toLowerCase();
                    data = data.filter(user =>
                        user.fullName?.toLowerCase().includes(searchLower) ||
                        user.email?.toLowerCase().includes(searchLower) ||
                        user.phone?.includes(debouncedSearchTerm)
                    );
                }

                // Apply status filter
                if (filters.status === 'active') {
                    data = data.filter(user => user.isActive === true);
                } else if (filters.status === 'inactive') {
                    data = data.filter(user => user.isActive === false);
                }

                // Apply role filter (only for Super Admin)
                if (isSuperAdmin && filters.role !== 'all') {
                    data = data.filter(user => user.role === filters.role);
                }

                // Apply date range filter
                if (filters.dateFrom) {
                    const fromDate = new Date(filters.dateFrom);
                    data = data.filter(user => new Date(user.createdAt) >= fromDate);
                }
                if (filters.dateTo) {
                    const toDate = new Date(filters.dateTo);
                    toDate.setHours(23, 59, 59);
                    data = data.filter(user => new Date(user.createdAt) <= toDate);
                }

                console.log('✅ Final filtered users:', data);
                return data;
            } catch (err) {
                console.error('❌ Error in queryFn:', err);
                setError(err.message);
                return [];
            }
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setFormSuccess('User created successfully!');
            setIsSubmitting(false);
            closeModal();
            setTimeout(() => setFormSuccess(''), 3000);
        },
        onError: (error) => {
            setFormError(error.response?.data?.message || 'Failed to create user');
            setIsSubmitting(false);
            setTimeout(() => setFormError(''), 3000);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => userService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setFormSuccess('User updated successfully!');
            setIsSubmitting(false);
            closeModal();
            setTimeout(() => setFormSuccess(''), 3000);
        },
        onError: (error) => {
            setFormError(error.response?.data?.message || 'Failed to update user');
            setIsSubmitting(false);
            setTimeout(() => setFormError(''), 3000);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: userService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setError('');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete user');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Toggle status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: userService.toggleStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setError('');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to toggle user status');
            setTimeout(() => setError(''), 3000);
        },
    });

    const openModal = (user = null) => {
        setFormError('');
        setFormSuccess('');
        if (user) {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                password: '',
                confirmPassword: '',
                role: user.role || 'user',
            });
        } else {
            setEditingUser(null);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                role: 'user',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            role: 'user',
        });
        setFormError('');
        setFormSuccess('');
        setIsSubmitting(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setIsSubmitting(true);

        if (!formData.fullName.trim()) {
            setFormError('Full name is required');
            setIsSubmitting(false);
            return;
        }
        if (!formData.email.trim()) {
            setFormError('Email is required');
            setIsSubmitting(false);
            return;
        }

        if (editingUser) {
            // Update existing user
            const updateData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone || '',
            };
            // Only include password if provided
            if (formData.password) {
                if (formData.password.length < 6) {
                    setFormError('Password must be at least 6 characters');
                    setIsSubmitting(false);
                    return;
                }
                if (formData.password !== formData.confirmPassword) {
                    setFormError('Passwords do not match');
                    setIsSubmitting(false);
                    return;
                }
                updateData.password = formData.password;
            }
            updateMutation.mutate({
                id: editingUser._id || editingUser.id,
                data: updateData,
            });
        } else {
            // Create new user
            if (!formData.password) {
                setFormError('Password is required for new user');
                setIsSubmitting(false);
                return;
            }
            if (formData.password.length < 6) {
                setFormError('Password must be at least 6 characters');
                setIsSubmitting(false);
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setFormError('Passwords do not match');
                setIsSubmitting(false);
                return;
            }
            createMutation.mutate({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone || '',
                password: formData.password,
                role: 'user',
            });
        }
    };

    const handleDelete = (id, userName) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleToggleStatus = (id) => {
        if (window.confirm('Are you sure you want to toggle this user\'s status?')) {
            toggleStatusMutation.mutate(id);
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive
            ? <Badge variant="success">Active</Badge>
            : <Badge variant="danger">Inactive</Badge>;
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return <Badge variant="primary">Super Admin</Badge>;
            case 'admin':
                return <Badge variant="warning">Admin</Badge>;
            default:
                return <Badge variant="info">User</Badge>;
        }
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            role: 'all',
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
            filters.role !== 'all' ||
            filters.dateFrom !== '' ||
            filters.dateTo !== '';
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    // Pagination
    const totalPages = Math.ceil((users?.length || 0) / itemsPerPage);
    const paginatedUsers = users?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isSuperAdmin ? 'Manage Users' : 'Users'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isSuperAdmin
                            ? 'View and manage all regular users in the system'
                            : 'View and manage regular users'
                        }
                    </p>
                </div>
                {isSuperAdmin && (
                    <Button onClick={() => openModal()} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        {isSuperAdmin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    value={filters.role}
                                    onChange={(e) => {
                                        setFilters({ ...filters, role: e.target.value });
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        )}
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
                    {isSuperAdmin && filters.role !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            Role: {filters.role}
                            <button onClick={() => setFilters({ ...filters, role: 'all' })} className="hover:text-blue-900">
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

            {/* User List */}
            {users?.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                        <Button onClick={() => refetch()} className="mt-4">
                            Refresh
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
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">User</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Email</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Phone</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Role</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Status</th>
                                        <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">Joined</th>
                                        <th className="text-center text-sm font-medium text-gray-500 py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers?.map((user) => (
                                        <tr key={user._id || user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-700">
                                                            {user.fullName?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {user.fullName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{user.phone || '-'}</td>
                                            <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                                            <td className="py-3 px-4">{getStatusBadge(user.isActive)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {isSuperAdmin && (
                                                        <>
                                                            <Link
                                                                to={`/super-admin/users/${user._id || user.id}`}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View details & tests"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => openModal(user)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(user._id || user.id)}
                                                                className={`p-1.5 ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} rounded-lg transition-colors`}
                                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user._id || user.id, user.fullName)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {!isSuperAdmin && (
                                                        <span className="text-xs text-gray-400">View only</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, users?.length || 0)} of {users?.length || 0} users
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

            {/* Modal - Add/Edit User */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingUser ? 'Edit User' : 'Add User'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <span className="text-red-500 text-sm">⚠</span>
                                <p className="text-sm text-red-700">{formError}</p>
                            </div>
                        )}

                        {formSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <p className="text-sm text-green-700">{formSuccess}</p>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {editingUser ? 'New Password (optional)' : 'Password *'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                                    required={!editingUser}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Confirm password"
                                />
                            </div>

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
                                    disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    {(isSubmitting || createMutation.isLoading || updateMutation.isLoading) ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>{editingUser ? 'Update' : 'Create'} User</>
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