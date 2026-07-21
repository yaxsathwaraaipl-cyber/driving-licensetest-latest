import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useLocation } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, Save, X, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { authService } from '../../services/authService';
import { countryService } from '../../services/countryService';
import { provinceService } from '../../services/provinceService';

export default function UserProfilePage() {
    const { user, updateUser } = useAuthStore();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const formRef = useRef(null);
    const location = useLocation();

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        countryId: '',
        provinceId: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log('UserProfilePage rendered, location:', location.pathname);
    console.log('User data:', user);

    // Fetch countries
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: countryService.getAll,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });

    // Fetch provinces - only when a country is selected
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
        staleTime: 5 * 60 * 1000,
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            console.log('Initializing form with user data:', user);

            let countryId = '';
            let provinceId = '';

            // Extract province ID
            if (user.provinceId) {
                if (typeof user.provinceId === 'object') {
                    provinceId = user.provinceId._id || user.provinceId.id || '';
                    // If country info is nested in province
                    if (user.provinceId.country_id) {
                        countryId = user.provinceId.country_id._id || user.provinceId.country_id.id || '';
                    }
                } else if (typeof user.provinceId === 'string') {
                    provinceId = user.provinceId;
                }
            }

            // If user has countryId directly
            if (user.countryId) {
                if (typeof user.countryId === 'object') {
                    countryId = user.countryId._id || user.countryId.id || '';
                } else if (typeof user.countryId === 'string') {
                    countryId = user.countryId;
                }
            }

            console.log('Extracted countryId:', countryId);
            console.log('Extracted provinceId:', provinceId);

            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                email: user.email || '',
                countryId: countryId,
                provinceId: provinceId,
            });

            if (user.profileImage) {
                setImagePreview(user.profileImage);
            }
        }
    }, [user]);

    // ✅ Fix: Fetch province details if we only have an ID
    useEffect(() => {
        const fetchProvinceDetails = async () => {
            if (formData.provinceId) {
                try {
                    // Check if we already have this province in cache
                    const cachedProvinces = queryClient.getQueryData(['provinces', formData.countryId]);
                    const provinceExists = cachedProvinces?.some(p => {
                        const pId = p._id || p.id;
                        return pId === formData.provinceId;
                    });

                    // If not in cache, fetch it
                    if (!provinceExists) {
                        console.log('Fetching province details for ID:', formData.provinceId);
                        const provinceData = await provinceService.getById(formData.provinceId);
                        console.log('Fetched province data:', provinceData);

                        // If province has country info, update countryId
                        if (provinceData && provinceData.country_id) {
                            const countryId = provinceData.country_id._id || provinceData.country_id.id || '';
                            if (countryId && !formData.countryId) {
                                setFormData(prev => ({
                                    ...prev,
                                    countryId: countryId
                                }));
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching province details:', error);
                }
            }
        };

        fetchProvinceDetails();
    }, [formData.provinceId, formData.countryId, queryClient]);

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const userId = user._id || user.id;
            console.log('Sending update request for user:', userId);
            const response = await authService.updateUser(userId, data);
            console.log('Update response:', response);
            return response;
        },
        onSuccess: (response) => {
            console.log('Update successful:', response);
            const updatedUser = response.data || response;

            updateUser(updatedUser);
            queryClient.invalidateQueries({
                queryKey: ['user', user._id || user.id],
                exact: true
            });

            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setIsSubmitting(false);

            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            console.error('Update error:', error);
            setError(error.response?.data?.message || 'Failed to update profile');
            setIsSubmitting(false);
            setTimeout(() => setError(''), 3000);
        },
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('fullName', formData.fullName);
            submitData.append('phone', formData.phone || '');
            submitData.append('email', formData.email);
            submitData.append('countryId', formData.countryId || '');
            submitData.append('provinceId', formData.provinceId || '');

            if (profileImage) {
                submitData.append('profileImage', profileImage);
            }

            console.log('Submitting form data:', {
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                countryId: formData.countryId,
                provinceId: formData.provinceId,
                hasImage: !!profileImage
            });

            await updateProfileMutation.mutateAsync(submitData);
        } catch (err) {
            console.error('Error in handleSubmit:', err);
            setError(err.message || 'Failed to update profile');
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        let countryId = '';
        let provinceId = '';

        if (user?.provinceId) {
            if (typeof user.provinceId === 'object') {
                provinceId = user.provinceId._id || user.provinceId.id || '';
                if (user.provinceId.country_id) {
                    countryId = user.provinceId.country_id._id || user.provinceId.country_id.id || '';
                }
            } else if (typeof user.provinceId === 'string') {
                provinceId = user.provinceId;
            }
        }

        if (user?.countryId) {
            if (typeof user.countryId === 'object') {
                countryId = user.countryId._id || user.countryId.id || '';
            } else if (typeof user.countryId === 'string') {
                countryId = user.countryId;
            }
        }

        setFormData({
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            email: user?.email || '',
            countryId: countryId,
            provinceId: provinceId,
        });
        setProfileImage(null);
        setImagePreview(user?.profileImage || null);
        setIsEditing(false);
        setError('');
        setSuccess('');
        setIsSubmitting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleEditClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
    };

    const getCountryName = (countryId) => {
        if (!countryId) return 'Not set';
        const country = countries?.find(c => {
            const cId = c._id || c.id;
            return cId === countryId;
        });
        return country?.name || 'Not set';
    };

    const getProvinceName = (provinceId) => {
        if (!provinceId) return 'Not set';
        const province = provinces?.find(p => {
            const pId = p._id || p.id;
            return pId === provinceId;
        });
        return province?.name || 'Not set';
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500 mt-1">Manage your personal information</p>
            </div>

            <Card className="p-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-white">
                                    {formData.fullName?.charAt(0) || 'U'}
                                </span>
                            )}
                        </div>
                        {isEditing && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                                >
                                    <Camera className="h-5 w-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                {imagePreview && imagePreview !== user?.profileImage && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">
                        {formData.fullName || 'User'}
                    </h2>
                    <p className="text-sm text-gray-500 capitalize">{user?.role || 'User'}</p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    noValidate
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${isEditing
                                            ? 'bg-white border-blue-500 focus:border-blue-500 focus:ring-blue-50'
                                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                        }`}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${isEditing
                                            ? 'bg-white border-blue-500 focus:border-blue-500 focus:ring-blue-50'
                                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                        }`}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${isEditing
                                            ? 'bg-white border-blue-500 focus:border-blue-500 focus:ring-blue-50'
                                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                        }`}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                </div>
                                {isEditing ? (
                                    <select
                                        value={formData.countryId}
                                        onChange={(e) => {
                                            const selectedCountry = e.target.value;
                                            setFormData({
                                                ...formData,
                                                countryId: selectedCountry,
                                                provinceId: '' // Reset province when country changes
                                            });
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-blue-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                                    >
                                        <option value="">Select Country</option>
                                        {countries?.map((country) => {
                                            const countryId = country._id || country.id;
                                            return (
                                                <option key={countryId} value={countryId}>
                                                    {country.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                ) : (
                                    <div className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-600">
                                        {getCountryName(formData.countryId)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Province */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Province / State
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                {isEditing ? (
                                    <select
                                        value={formData.provinceId}
                                        onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
                                        disabled={!formData.countryId}
                                        className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 transition-all ${formData.countryId
                                                ? 'bg-white border-blue-500 focus:border-blue-500 focus:ring-blue-50'
                                                : 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500'
                                            }`}
                                    >
                                        <option value="">
                                            {!formData.countryId
                                                ? 'Select a country first'
                                                : 'Select Province'
                                            }
                                        </option>
                                        {provinces?.map((province) => {
                                            const provinceId = province._id || province.id;
                                            return (
                                                <option key={provinceId} value={provinceId}>
                                                    {province.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                ) : (
                                    <div className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-600">
                                        {getProvinceName(formData.provinceId)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        {isEditing ? (
                            <>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || updateProfileMutation.isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {(isSubmitting || updateProfileMutation.isLoading) ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSubmitting || updateProfileMutation.isLoading}
                                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                            >
                                <User className="h-4 w-4" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </Card>

            {/* Account Info Card */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Account ID</span>
                        <span className="text-sm font-mono text-gray-900">{user?._id || user?.id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Role</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{user?.role || 'User'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Country</span>
                        <span className="text-sm text-gray-900">{getCountryName(formData.countryId)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Province</span>
                        <span className="text-sm text-gray-900">{getProvinceName(formData.provinceId)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`text-sm font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {user?.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-500">Joined</span>
                        <span className="text-sm text-gray-900">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
}