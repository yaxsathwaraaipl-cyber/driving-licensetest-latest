import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Save, X, AlertCircle, CheckCircle, Plus, Trash2,
    Globe, MapPin, BookOpen, Clock, FileText
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { testService } from '../../services/testService';
import { countryService } from '../../services/countryService';
import { provinceService } from '../../services/provinceService';
import { questionBankService } from '../../services/questionBankService';
import { testCategoryService } from '../../services/testCategoryService';
import { useAuthStore } from '../../store/authStore';

export default function CreateEditTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const isEditMode = !!id;

    // Get admin's province and country from user
    const adminProvinceId = user?.provinceId?._id || user?.provinceId?.id || user?.provinceId;
    const adminCountryId = user?.countryId?._id || user?.countryId?.id || user?.countryId;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        countryId: adminCountryId || '',
        provinceId: adminProvinceId || '',
        passingScore: 70,
        isPublished: false,
        showAnswersAfterSubmission: true,
        categories: [],
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch countries (just to get country name for display)
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: countryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch provinces (just to get province name for display)
    const { data: provinces } = useQuery({
        queryKey: ['provinces-all'],
        queryFn: provinceService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch test categories (for the dropdown)
    const { data: testCategories } = useQuery({
        queryKey: ['test-categories'],
        queryFn: testCategoryService.getAll,
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

    // Fetch test if editing
    const { data: test, isLoading } = useQuery({
        queryKey: ['test', id],
        queryFn: () => testService.getById(id),
        enabled: isEditMode,
        retry: 2,
        retryDelay: 1000,
    });

    useEffect(() => {
        if (test) {
            setFormData({
                title: test.title || '',
                description: test.description || '',
                countryId: test.countryId?._id || test.countryId || adminCountryId || '',
                provinceId: test.provinceId?._id || test.provinceId || adminProvinceId || '',
                passingScore: test.passingScore || 70,
                isPublished: test.isPublished || false,
                showAnswersAfterSubmission: test.showAnswersAfterSubmission !== undefined ? test.showAnswersAfterSubmission : true,
                categories: test.categories || [],
            });
        }
    }, [test, adminProvinceId, adminCountryId]);

    // Get country and province names for display
    const getCountryName = (countryId) => {
        if (!countryId) return 'N/A';
        const country = countries?.find(c => {
            const cId = c._id || c.id;
            return String(cId) === String(countryId);
        });
        return country?.name || 'N/A';
    };

    const getProvinceName = (provinceId) => {
        if (!provinceId) return 'N/A';
        const province = provinces?.find(p => {
            const pId = p._id || p.id;
            return String(pId) === String(provinceId);
        });
        return province?.name || 'N/A';
    };

    const createMutation = useMutation({
        mutationFn: testService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['tests']);
            setSuccess('Test created successfully!');
            setIsSubmitting(false);
            setTimeout(() => navigate('/admin/tests'), 1500);
        },
        onError: (error) => {
            console.error('❌ Create error:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to create test');
            setIsSubmitting(false);
            setTimeout(() => setError(''), 5000);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => testService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['tests']);
            queryClient.invalidateQueries(['test', id]);
            setSuccess('Test updated successfully!');
            setIsSubmitting(false);
            setTimeout(() => navigate('/admin/tests'), 1500);
        },
        onError: (error) => {
            console.error('❌ Update error:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to update test');
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

    // Filter question banks by selected category
    const getFilteredQuestionBanks = (selectedCategoryId) => {
        if (!selectedCategoryId) return questionBanks || [];

        return questionBanks?.filter(bank => {
            // Try multiple possible field names for category
            const bankCategoryId = bank.categoryId?._id || bank.categoryId ||
                bank.testCategoryId?._id || bank.testCategoryId ||
                bank.category?._id || bank.category || '';

            // Check if bank belongs to admin's province
            const bankProvinceId = bank.provinceId?._id || bank.provinceId ||
                bank.province_id?.id || bank.province_id || '';

            const categoryMatch = String(bankCategoryId) === String(selectedCategoryId);
            const provinceMatch = bankProvinceId ? String(bankProvinceId) === String(formData.provinceId) : true;

            return categoryMatch && provinceMatch;
        }) || [];
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
            setError('Country is not set. Please contact admin.');
            setIsSubmitting(false);
            return;
        }
        if (!formData.provinceId) {
            setError('Province is not set. Please contact admin.');
            setIsSubmitting(false);
            return;
        }

        if (formData.categories.length === 0) {
            setError('Please add at least one category');
            setIsSubmitting(false);
            return;
        }

        // Validate categories
        for (let i = 0; i < formData.categories.length; i++) {
            const cat = formData.categories[i];
            if (!cat.categoryId) {
                setError(`Category ${i + 1}: Please select a test category`);
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

        // ✅ Format data according to API expectations
        const submitData = {
            title: formData.title.trim(),
            description: formData.description || '',
            countryId: formData.countryId,
            provinceId: formData.provinceId,
            passingScore: parseInt(formData.passingScore),
            isPublished: formData.isPublished,
            showAnswersAfterSubmission: formData.showAnswersAfterSubmission,
            categories: formData.categories.map(cat => ({
                categoryId: cat.categoryId,
                questionBankId: cat.questionBankId,
                numberOfQuestions: parseInt(cat.numberOfQuestions),
                timer: parseInt(cat.timer)
            }))
        };

        console.log('📤 Submitting test data:', JSON.stringify(submitData, null, 2));

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/tests" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Test' : 'Create Test'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isEditMode ? 'Update test details' : 'Create a new driving test'}
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
                {/* Test Details Card */}
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
                                placeholder="Enter test title"
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
                                placeholder="Enter test description"
                                rows="3"
                            />
                        </div>

                        {/* Country and Province - Read-only */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-sm text-gray-700 cursor-not-allowed">
                                        {getCountryName(formData.countryId)}
                                    </div>
                                    <input type="hidden" value={formData.countryId} />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Country is auto-assigned based on your admin profile.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Province <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-sm text-gray-700 cursor-not-allowed">
                                        {getProvinceName(formData.provinceId)}
                                    </div>
                                    <input type="hidden" value={formData.provinceId} />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Province is auto-assigned based on your admin profile.
                                </p>
                            </div>
                        </div>

                        {/* Passing Score */}
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

                        {/* Settings */}
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
                                    checked={formData.showAnswersAfterSubmission}
                                    onChange={(e) => setFormData({ ...formData, showAnswersAfterSubmission: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Show answers after submission</span>
                            </label>
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
                            {formData.categories.map((cat, index) => {
                                const filteredBanks = getFilteredQuestionBanks(cat.categoryId);

                                return (
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
                                            {/* Test Category Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Test Category <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={cat.categoryId}
                                                    onChange={(e) => {
                                                        const selectedId = e.target.value;
                                                        updateCategory(index, 'categoryId', selectedId);
                                                        updateCategory(index, 'questionBankId', '');
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                                >
                                                    <option value="">Select Test Category</option>
                                                    {testCategories?.map((category) => {
                                                        const categoryCountry = category.countryId?._id || category.countryId;
                                                        const categoryProvince = category.provinceId?._id || category.provinceId;

                                                        if (categoryCountry && categoryCountry !== formData.countryId) {
                                                            return null;
                                                        }
                                                        if (categoryProvince && categoryProvince !== formData.provinceId) {
                                                            return null;
                                                        }

                                                        return (
                                                            <option key={category._id} value={category._id}>
                                                                {category.title}
                                                                {category.countryId?.name ? ` (${category.countryId.name})` : ''}
                                                                {category.provinceId?.name ? ` - ${category.provinceId.name}` : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {testCategories?.length === 0 && 'No test categories available for your province.'}
                                                </p>
                                            </div>

                                            {/* Question Bank Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Question Bank <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={cat.questionBankId}
                                                    onChange={(e) => updateCategory(index, 'questionBankId', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                                    disabled={!cat.categoryId}
                                                >
                                                    <option value="">
                                                        {!cat.categoryId ? 'Select a category first' : 'Select Question Bank'}
                                                    </option>
                                                    {filteredBanks.length > 0 ? (
                                                        filteredBanks.map((bank) => (
                                                            <option key={bank._id} value={bank._id}>
                                                                {bank.title} ({bank.questions?.length || 0} questions)
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>
                                                            No question banks available
                                                        </option>
                                                    )}
                                                </select>
                                                {cat.categoryId && filteredBanks.length === 0 && (
                                                    <p className="text-xs text-amber-500 mt-1">
                                                        No question banks found for this category.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Number of Questions */}
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

                                            {/* Timer */}
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
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                    <Link to="/admin/tests" className="flex-1">
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
                                {isEditMode ? 'Update' : 'Create'} Test
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}