import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Save, X, AlertCircle, CheckCircle, Plus, Trash2,
    Globe, MapPin, BookOpen, Clock, FileText, Users, TrendingUp,
    Infinity
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { practiceTestService } from '../../services/practiceTestService';
import { countryService } from '../../services/countryService';
import { provinceService } from '../../services/provinceService';
import { questionBankService } from '../../services/questionBankService';
import { useAuthStore } from '../../store/authStore';

export default function CreateEditPracticeTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        countryId: '',
        provinceId: '',
        passingScore: 70,
        isPublished: false,
        unlimitedAttempts: true,
        maxAttempts: 3,
        showAnswersImmediately: true,
        showExplanations: true,
        allowReview: true,
        categories: [],
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userProvinceId = user?.provinceId?._id || user?.provinceId?.id || user?.provinceId;

    // Fetch countries
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: countryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch provinces
    const { data: provinces } = useQuery({
        queryKey: ['provinces-all'],
        queryFn: provinceService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch question banks
    const { data: questionBanks } = useQuery({
        queryKey: ['question-banks'],
        queryFn: questionBankService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch practice test if editing
    const { data: test, isLoading } = useQuery({
        queryKey: ['practice-test', id],
        queryFn: () => practiceTestService.getById(id),
        enabled: isEditMode,
        retry: 2,
        retryDelay: 1000,
    });

    useEffect(() => {
        if (test) {
            setFormData({
                title: test.title || '',
                description: test.description || '',
                countryId: test.countryId?._id || test.countryId || '',
                provinceId: test.provinceId?._id || test.provinceId || userProvinceId || '',
                passingScore: test.passingScore || 70,
                isPublished: test.isPublished || false,
                unlimitedAttempts: test.unlimitedAttempts !== undefined ? test.unlimitedAttempts : true,
                maxAttempts: test.maxAttempts || 3,
                showAnswersImmediately: test.showAnswersImmediately !== undefined ? test.showAnswersImmediately : true,
                showExplanations: test.showExplanations !== undefined ? test.showExplanations : true,
                allowReview: test.allowReview !== undefined ? test.allowReview : true,
                categories: test.categories || [],
            });
        } else {
            if (userProvinceId) {
                const userProvince = provinces?.find(p => p._id === userProvinceId || p.id === userProvinceId);
                if (userProvince) {
                    const countryId = userProvince.country_id?.id || userProvince.countryId?._id || userProvince.countryId;
                    setFormData(prev => ({
                        ...prev,
                        countryId: countryId || '',
                        provinceId: userProvinceId,
                    }));
                }
            }
        }
    }, [test, userProvinceId, provinces]);

    const createMutation = useMutation({
        mutationFn: practiceTestService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['practice-tests']);
            setSuccess('Practice test created successfully!');
            setIsSubmitting(false);
            setTimeout(() => navigate('/admin/practice-tests'), 1500);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to create practice test');
            setIsSubmitting(false);
            setTimeout(() => setError(''), 5000);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => practiceTestService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['practice-tests']);
            queryClient.invalidateQueries(['practice-test', id]);
            setSuccess('Practice test updated successfully!');
            setIsSubmitting(false);
            setTimeout(() => navigate('/admin/practice-tests'), 1500);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to update practice test');
            setIsSubmitting(false);
            setTimeout(() => setError(''), 5000);
        },
    });

    const addCategory = () => {
        setFormData({
            ...formData,
            categories: [
                ...formData.categories,
                {
                    categoryId: '',
                    questionBankId: '',
                    numberOfQuestions: 10,
                    timer: 5,
                },
            ],
        });
    };

    const removeCategory = (index) => {
        const newCategories = [...formData.categories];
        newCategories.splice(index, 1);
        setFormData({ ...formData, categories: newCategories });
    };

    const updateCategory = (index, field, value) => {
        const newCategories = [...formData.categories];
        newCategories[index][field] = value;
        setFormData({ ...formData, categories: newCategories });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (!formData.title.trim()) {
            setError('Title is required');
            setIsSubmitting(false);
            return;
        }
        if (!formData.countryId) {
            setError('Please select a country');
            setIsSubmitting(false);
            return;
        }
        if (!formData.provinceId) {
            setError('Please select a province');
            setIsSubmitting(false);
            return;
        }
        if (formData.categories.length === 0) {
            setError('Please add at least one category');
            setIsSubmitting(false);
            return;
        }

        for (let i = 0; i < formData.categories.length; i++) {
            const cat = formData.categories[i];
            if (!cat.categoryId) {
                setError(`Category ${i + 1}: Please select a category`);
                setIsSubmitting(false);
                return;
            }
            if (!cat.questionBankId) {
                setError(`Category ${i + 1}: Please select a question bank`);
                setIsSubmitting(false);
                return;
            }
            if (cat.numberOfQuestions < 1) {
                setError(`Category ${i + 1}: Number of questions must be at least 1`);
                setIsSubmitting(false);
                return;
            }
            if (cat.timer < 1) {
                setError(`Category ${i + 1}: Timer must be at least 1 minute`);
                setIsSubmitting(false);
                return;
            }
        }

        const submitData = {
            ...formData,
            passingScore: parseInt(formData.passingScore),
        };

        if (isEditMode) {
            updateMutation.mutate({ id, data: submitData });
        } else {
            createMutation.mutate(submitData);
        }
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/practice-tests" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Practice Test' : 'Create Practice Test'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isEditMode ? 'Update practice test details' : 'Create a new practice test'}
                        </p>
                    </div>
                </div>
                <Badge variant={isEditMode ? 'warning' : 'info'}>
                    {isEditMode ? 'Edit Mode' : 'Create Mode'}
                </Badge>
            </div>

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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                placeholder="Enter practice test title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                placeholder="Enter practice test description"
                                rows="3"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        value={formData.countryId}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                countryId: e.target.value,
                                                provinceId: '',
                                            });
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                        {provinces?.map((province) => {
                                            const provinceCountryId = province.country_id?.id || province.countryId?._id || province.countryId;
                                            if (provinceCountryId === formData.countryId) {
                                                return (
                                                    <option key={province._id || province.id} value={province._id || province.id}>
                                                        {province.name}
                                                    </option>
                                                );
                                            }
                                            return null;
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Passing Score (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.passingScore}
                                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                                className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                min="0"
                                max="100"
                                required
                            />
                        </div>

                        {/* Practice Test Specific Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Attempts
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.unlimitedAttempts}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                unlimitedAttempts: e.target.checked,
                                                maxAttempts: e.target.checked ? 0 : formData.maxAttempts || 3
                                            })}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Unlimited attempts</span>
                                    </label>
                                    {!formData.unlimitedAttempts && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Attempts
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.maxAttempts}
                                                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
                                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                                min="1"
                                                disabled={formData.unlimitedAttempts}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Publish test (visible to users)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.showAnswersImmediately}
                                        onChange={(e) => setFormData({ ...formData, showAnswersImmediately: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Show answers immediately</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.showExplanations}
                                        onChange={(e) => setFormData({ ...formData, showExplanations: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Show explanations</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.allowReview}
                                        onChange={(e) => setFormData({ ...formData, allowReview: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Allow review after submission</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Categories Section */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Category
                        </Button>
                    </div>

                    {formData.categories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No categories added. Click "Add Category" to add one.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.categories.map((cat, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">Category {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeCategory(index)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={cat.categoryId}
                                                onChange={(e) => updateCategory(index, 'categoryId', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                            >
                                                <option value="">Select Category</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Question Bank <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={cat.questionBankId}
                                                onChange={(e) => updateCategory(index, 'questionBankId', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                            >
                                                <option value="">Select Question Bank</option>
                                                {questionBanks?.map((bank) => (
                                                    <option key={bank._id} value={bank._id}>
                                                        {bank.title} ({bank.questions?.length || 0} questions)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Number of Questions <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={cat.numberOfQuestions}
                                                onChange={(e) => updateCategory(index, 'numberOfQuestions', parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Timer (minutes) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={cat.timer}
                                                onChange={(e) => updateCategory(index, 'timer', parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <div className="flex gap-3">
                    <Link to="/admin/practice-tests" className="flex-1">
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
                                {isEditMode ? 'Update' : 'Create'} Practice Test
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}