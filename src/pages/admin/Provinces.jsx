import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Save, X, AlertCircle, MapPin, Globe, Upload, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { provinceService } from '../../services/provinceService';
import { countryService } from '../../services/countryService';

export default function Provinces() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvince, setEditingProvince] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        countryId: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    // Fetch countries for dropdown
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: countryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch provinces
    const { data: provinces, isLoading } = useQuery({
        queryKey: ['provinces'],
        queryFn: provinceService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            console.log('📤 Creating province with data:', data);

            // If there's an image, use FormData with country_id
            if (data.image) {
                const formData = new FormData();
                formData.append('name', data.name);
                formData.append('description', data.description || '');
                formData.append('country_id', data.country_id || data.countryId);
                formData.append('image', data.image);

                console.log('📤 FormData with country_id:');
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }

                return await provinceService.create(formData);
            }

            // Otherwise send as JSON with country_id
            console.log('📤 Sending JSON with country_id:', data);
            return await provinceService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['provinces']);
            setSuccess('Province created successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            console.error('❌ Create error:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to create province');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            console.log('📤 Updating province with data:', data);

            // If there's an image, use FormData with country_id
            if (data.image) {
                const formData = new FormData();
                formData.append('name', data.name);
                formData.append('description', data.description || '');
                formData.append('country_id', data.country_id || data.countryId);
                formData.append('image', data.image);

                console.log('📤 FormData with country_id:');
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }

                return await provinceService.update(id, formData);
            }

            // Otherwise send as JSON with country_id
            console.log('📤 Sending JSON with country_id:', data);
            return await provinceService.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['provinces']);
            setSuccess('Province updated successfully!');
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            console.error('❌ Update error:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to update province');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: provinceService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['provinces']);
            setSuccess('Province deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete province');
            setTimeout(() => setError(''), 3000);
        },
    });

    const openModal = (province = null) => {
        setError('');
        setImagePreview(null);
        if (province) {
            setEditingProvince(province);

            // ✅ Fix: Extract country ID from the province object
            let countryId = '';
            if (province.country_id) {
                // Province has country_id object (from API response)
                countryId = province.country_id.id || province.country_id._id || '';
            } else if (province.countryId) {
                // Province has countryId (camelCase)
                if (typeof province.countryId === 'object') {
                    countryId = province.countryId.id || province.countryId._id || '';
                } else {
                    countryId = province.countryId;
                }
            }

            console.log('📝 Editing province, extracted countryId:', countryId);

            setFormData({
                name: province.name || '',
                description: province.description || '',
                countryId: countryId,
                image: null,
            });
            if (province.image) {
                setImagePreview(province.image);
            }
        } else {
            setEditingProvince(null);
            setFormData({
                name: '',
                description: '',
                countryId: '',
                image: null
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProvince(null);
        setFormData({
            name: '',
            description: '',
            countryId: '',
            image: null
        });
        setImagePreview(null);
        setError('');
        setSuccess('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        console.log('📝 Form data before submit:', formData);

        if (!formData.name.trim()) {
            setError('Province name is required');
            return;
        }
        if (!formData.countryId) {
            setError('Please select a country');
            return;
        }

        try {
            // ✅ Prepare data with country_id (snake_case) as expected by API
            const submitData = {
                name: formData.name.trim(),
                description: formData.description || '',
                country_id: formData.countryId,  // Use country_id (snake_case)
                image: formData.image || null,
            };

            console.log('📤 Submitting province data with country_id:', submitData);

            if (editingProvince) {
                const id = editingProvince.id || editingProvince._id;
                await updateMutation.mutateAsync({ id, data: submitData });
            } else {
                await createMutation.mutateAsync(submitData);
            }
        } catch (err) {
            console.error('❌ Error submitting form:', err);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this province?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const removeImage = () => {
        setFormData({ ...formData, image: null });
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Get country name from province's country_id object
    const getCountryName = (province) => {
        if (!province) return 'N/A';

        // Check for country_id (from province API response)
        if (province.country_id) {
            return province.country_id.name || 'Unknown Country';
        }

        // Check for countryId (alternative format)
        if (province.countryId) {
            if (typeof province.countryId === 'object') {
                return province.countryId.name || 'Unknown Country';
            }
            // If it's a string ID, look it up
            const country = countries?.find(c => {
                const cId = c.id || c._id;
                return String(cId) === String(province.countryId);
            });
            return country?.name || 'Unknown Country';
        }

        return 'N/A';
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
                    <h1 className="text-2xl font-bold text-gray-900">Manage Provinces</h1>
                    <p className="text-gray-500 mt-1">Add, edit, or remove provinces for the system</p>
                </div>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Province
                </Button>
            </div>

            {provinces?.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No provinces yet</h3>
                        <p className="text-gray-500 mt-2">Create your first province to get started.</p>
                        <Button onClick={() => openModal()} className="mt-4">
                            Create Province
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provinces?.map((province) => {
                        const provinceId = province.id || province._id;
                        const countryName = getCountryName(province);

                        return (
                            <Card key={provinceId} className="p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                            <h3 className="font-semibold text-gray-900">{province.name}</h3>
                                        </div>
                                        {province.description && (
                                            <p className="text-sm text-gray-500 mt-1">{province.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            Country: {countryName}
                                        </p>
                                        {province.image && (
                                            <div className="mt-2">
                                                <img
                                                    src={province.image}
                                                    alt={province.name}
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openModal(province)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(provinceId)}
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

            {/* Modal - Add/Edit Province */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProvince ? 'Edit Province' : 'Add Province'}
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
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.countryId}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        console.log('📝 Selected country ID:', selectedId);
                                        setFormData({ ...formData, countryId: selectedId });
                                    }}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    required
                                >
                                    <option value="">Select a country</option>
                                    {countries?.map((country) => {
                                        const countryId = country.id || country._id;
                                        return (
                                            <option key={countryId} value={countryId}>
                                                {country.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {countries?.length === 0 && 'No countries available. Create one first.'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Province Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Enter province name"
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
                                    placeholder="Enter province description"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload image</p>
                                            <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 2MB</p>
                                        </div>
                                    </div>
                                    {imagePreview && (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                                            {editingProvince ? 'Update' : 'Create'}
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