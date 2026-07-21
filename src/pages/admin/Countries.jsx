import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Save, X, AlertCircle, Globe, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { countryService } from '../../services/countryService';
import { provinceService } from '../../services/provinceService';

export default function Countries() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const queryClient = useQueryClient();

    // Fetch countries
    const { data: countries, isLoading } = useQuery({
        queryKey: ['countries'],
        queryFn: countryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch provinces to get province counts per country
    const { data: provinces } = useQuery({
        queryKey: ['provinces-all'],
        queryFn: provinceService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: countryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['countries']);
            setSuccess('Country created successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to create country');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => countryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['countries']);
            setSuccess('Country updated successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to update country');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: countryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['countries']);
            setSuccess('Country deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete country');
            setTimeout(() => setError(''), 3000);
        },
    });

    const openModal = (country = null) => {
        setError('');
        if (country) {
            setEditingCountry(country);
            setFormData({
                name: country.name || '',
                code: country.code || '',
            });
        } else {
            setEditingCountry(null);
            setFormData({ name: '', code: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCountry(null);
        setFormData({ name: '', code: '' });
        setError('');
        setSuccess('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Country name is required');
            return;
        }

        if (editingCountry) {
            updateMutation.mutate({
                id: editingCountry.id || editingCountry._id,
                data: formData,
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this country?')) {
            deleteMutation.mutate(id);
        }
    };

    // ✅ Fix: Get province count for a country - uses country_id.id from province response
    const getProvinceCount = (countryId) => {
        if (!provinces || !provinces.length) return 0;

        const countryIdStr = String(countryId);

        return provinces.filter(p => {
            // The province has country_id object with id field
            const pCountryId = p.country_id?.id || p.countryId?.id || p.country_id || p.countryId || '';
            return String(pCountryId) === countryIdStr;
        }).length;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

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

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Countries</h1>
                    <p className="text-gray-500 mt-1">Add, edit, or remove countries for the system</p>
                </div>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Country
                </Button>
            </div>

            {countries?.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No countries yet</h3>
                        <p className="text-gray-500 mt-2">Create your first country to get started.</p>
                        <Button onClick={() => openModal()} className="mt-4">
                            Create Country
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countries?.map((country) => {
                        const countryId = country.id || country._id;
                        const provinceCount = getProvinceCount(countryId);

                        return (
                            <Card key={countryId} className="p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                            <h3 className="font-semibold text-gray-900">{country.name}</h3>
                                            {country.code && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {country.code}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Provinces: {provinceCount}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openModal(country)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(countryId)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal - Add/Edit Country */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCountry ? 'Edit Country' : 'Add Country'}
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
                                    Country Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Enter country name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Enter country code (e.g., US, CA)"
                                    maxLength="2"
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
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    {(createMutation.isLoading || updateMutation.isLoading) ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            {editingCountry ? 'Update' : 'Create'}
                                        </>
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