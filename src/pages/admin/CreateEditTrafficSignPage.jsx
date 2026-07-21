import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Save, X, Upload, AlertCircle, CheckCircle,
    Image as ImageIcon, MapPin, List, Trash2, Plus
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { trafficSignService } from '../../services/trafficSignService';
import { categoryService } from '../../services/categoryService';
import { provinceService } from '../../services/provinceService';

export default function CreateEditTrafficSignPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        provinceIds: [],
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProvinces, setSelectedProvinces] = useState([]);

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['traffic-categories'],
        queryFn: categoryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 0, // Always fetch fresh
    });

    // Fetch provinces
    const { data: provinces } = useQuery({
        queryKey: ['provinces-all'],
        queryFn: async () => {
            const data = await provinceService.getAll();
            console.log('📊 Provinces from API:', data);
            return data;
        },
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 0, // Always fetch fresh
    });

    // Fetch traffic sign if editing
    const { data: sign, isLoading, refetch: refetchSign } = useQuery({
        queryKey: ['traffic-sign', id],
        queryFn: () => trafficSignService.getById(id),
        enabled: isEditMode,
        retry: 2,
        retryDelay: 1000,
        staleTime: 0, // Always fetch fresh
    });

    // Set form data when editing - runs when sign or provinces change
    useEffect(() => {
        if (sign && provinces) {
            console.log('📝 Setting form data from sign:', sign);
            console.log('📝 Province IDs from sign:', sign.provinceIds);

            // Ensure provinceIds are strings and match the available provinces
            let provinceIds = [];
            if (sign.provinceIds) {
                provinceIds = sign.provinceIds.map(id => {
                    // If it's an object with _id, extract it
                    if (typeof id === 'object' && id !== null) {
                        return String(id._id || id.id || '');
                    }
                    return String(id);
                }).filter(id => id && id.trim() !== '');
            }

            console.log('📝 Processed province IDs:', provinceIds);

            setFormData({
                title: sign.title || '',
                description: sign.description || '',
                categoryId: sign.categoryId || '',
                provinceIds: provinceIds,
                image: null,
            });
            setSelectedProvinces(provinceIds);

            if (sign.image) {
                setImagePreview(sign.image);
            }
        }
    }, [sign, provinces]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            console.log('Creating traffic sign with data:', data);
            return await trafficSignService.create(data);
        },
        onSuccess: () => {
            // ✅ Invalidate ALL related queries
            queryClient.invalidateQueries({ queryKey: ['traffic-signs'] });
            queryClient.invalidateQueries({ queryKey: ['traffic-sign'] });
            setSuccess('Traffic sign created successfully!');
            setIsSubmitting(false);
            setTimeout(() => {
                navigate('/admin/traffic-signs', { replace: true });
            }, 1500);
        },
        onError: (error) => {
            console.error('Create error details:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to create traffic sign');
            setIsSubmitting(false);
            setTimeout(() => setError(''), 5000);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            console.log('Updating traffic sign with data:', data);
            return await trafficSignService.update(id, data);
        },
        onSuccess: () => {
            // ✅ Invalidate ALL related queries
            queryClient.invalidateQueries({ queryKey: ['traffic-signs'] });
            queryClient.invalidateQueries({ queryKey: ['traffic-sign'] });
            queryClient.invalidateQueries({ queryKey: ['traffic-sign', id] });
            setSuccess('Traffic sign updated successfully!');
            setIsSubmitting(false);
            setTimeout(() => {
                navigate('/admin/traffic-signs', { replace: true });
            }, 1500);
        },
        onError: (error) => {
            console.error('Update error details:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to update traffic sign');
            setIsSubmitting(false);
            setTimeout(() => setError(''), 5000);
        },
    });

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

    const handleProvinceToggle = (provinceId) => {
        // Ensure we're working with strings
        const id = String(provinceId);

        setSelectedProvinces(prev => {
            const newSelection = prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id];

            // Update formData with the new selection
            setFormData(prevData => ({
                ...prevData,
                provinceIds: newSelection
            }));

            return newSelection;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        // Validate
        if (!formData.title.trim()) {
            setError('Title is required');
            setIsSubmitting(false);
            return;
        }
        if (!formData.categoryId) {
            setError('Please select a category');
            setIsSubmitting(false);
            return;
        }
        if (selectedProvinces.length === 0) {
            setError('Please select at least one province');
            setIsSubmitting(false);
            return;
        }

        try {
            // Ensure provinceIds are strings
            const provinceIds = selectedProvinces.map(id => String(id));

            const submitData = {
                title: formData.title.trim(),
                description: formData.description || '',
                categoryId: formData.categoryId,
                provinceIds: provinceIds,
                image: formData.image || null,
            };

            console.log('Submitting data:', submitData);
            console.log('Province IDs being sent:', provinceIds);

            if (isEditMode) {
                await updateMutation.mutateAsync({ id, data: submitData });
            } else {
                await createMutation.mutateAsync(submitData);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
        }
    };

    // Check if a province is selected
    const isProvinceSelected = (provinceId) => {
        const id = String(provinceId);
        return selectedProvinces.includes(id);
    };

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/traffic-signs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Traffic Sign' : 'Add Traffic Sign'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isEditMode ? 'Update traffic sign details' : 'Create a new traffic sign'}
                        </p>
                    </div>
                </div>
                <Badge variant={isEditMode ? 'warning' : 'info'}>
                    {isEditMode ? 'Edit Mode' : 'Create Mode'}
                </Badge>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                placeholder="Enter traffic sign title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                placeholder="Enter description"
                                rows="3"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <List className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Provinces */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Provinces <span className="text-red-500">*</span>
                                <span className="text-xs text-gray-400 ml-2">(Select at least one)</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                                {provinces?.map((province) => {
                                    const provinceId = String(province._id || province.id);
                                    const isSelected = isProvinceSelected(provinceId);
                                    return (
                                        <label
                                            key={provinceId}
                                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected
                                                    ? 'bg-blue-100 border border-blue-300'
                                                    : 'hover:bg-gray-100'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleProvinceToggle(provinceId)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <MapPin className="h-3 w-3 text-gray-400" />
                                            <span className="text-sm text-gray-700">{province.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Selected: {selectedProvinces.length} province{selectedProvinces.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image
                            </label>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload image</p>
                                        <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 2MB</p>
                                    </div>
                                </div>
                                {imagePreview && (
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                    <Link to="/admin/traffic-signs" className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {isEditMode ? 'Update' : 'Create'} Traffic Sign
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}