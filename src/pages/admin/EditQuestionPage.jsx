import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Save, X, Upload, AlertCircle, CheckCircle,
    Image as ImageIcon, Eye, Trash2, Plus,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { questionBankService } from '../../services/questionBankService';

export default function EditQuestionPage() {
    const { id: bankId, questionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        questionText: '',
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ],
        explanation: '',
        marks: 1,
    });
    const [questionImageFile, setQuestionImageFile] = useState(null);
    const [explanationImageFile, setExplanationImageFile] = useState(null);
    const [questionImagePreview, setQuestionImagePreview] = useState(null);
    const [explanationImagePreview, setExplanationImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch question bank to get the specific question
    const { data: bank, isLoading } = useQuery({
        queryKey: ['question-bank', bankId],
        queryFn: () => questionBankService.getById(bankId),
        retry: 2,
        retryDelay: 1000,
    });

    // Set form data when bank loads
    useEffect(() => {
        if (bank && bank.questions) {
            const question = bank.questions.find(q => q._id === questionId);
            if (question) {
                setFormData({
                    questionText: question.questionText || '',
                    options: question.options || [
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                    ],
                    explanation: question.explanation || '',
                    marks: question.marks || 1,
                });
                if (question.questionImage) {
                    setQuestionImagePreview(question.questionImage);
                }
                if (question.explanationImage) {
                    setExplanationImagePreview(question.explanationImage);
                }
            }
        }
    }, [bank, questionId]);

    // Update question mutation
    const updateQuestionMutation = useMutation({
        mutationFn: (data) => questionBankService.updateQuestion(bankId, questionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['question-bank', bankId]);
            setSuccess('Question updated successfully!');
            setIsSubmitting(false);
            setHasChanges(false);
            setTimeout(() => {
                navigate(`/admin/question-banks/${bankId}`);
            }, 1500);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to update question');
            setIsSubmitting(false);
            setTimeout(() => setError(''), 5000);
        },
    });

    const updateOption = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData({ ...formData, options: newOptions });
        setHasChanges(true);
    };

    const addOption = () => {
        if (formData.options.length < 6) {
            setFormData({
                ...formData,
                options: [...formData.options, { text: '', isCorrect: false }]
            });
            setHasChanges(true);
        }
    };

    const removeOption = (index) => {
        if (formData.options.length > 2) {
            const newOptions = [...formData.options];
            newOptions.splice(index, 1);
            setFormData({ ...formData, options: newOptions });
            setHasChanges(true);
        } else {
            setError('Question must have at least 2 options');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleQuestionImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setQuestionImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQuestionImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setHasChanges(true);
        }
        e.target.value = '';
    };

    const handleExplanationImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setExplanationImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setExplanationImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setHasChanges(true);
        }
        e.target.value = '';
    };

    const removeQuestionImage = () => {
        setQuestionImageFile(null);
        setQuestionImagePreview(null);
        setHasChanges(true);
    };

    const removeExplanationImage = () => {
        setExplanationImageFile(null);
        setExplanationImagePreview(null);
        setHasChanges(true);
    };

    // In the handleSubmit function, add detailed logging
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (!formData.questionText.trim()) {
            setError('Question text is required');
            setIsSubmitting(false);
            return;
        }
        const hasCorrect = formData.options.some(opt => opt.isCorrect);
        if (!hasCorrect) {
            setError('Question must have at least one correct option');
            setIsSubmitting(false);
            return;
        }
        const allOptionsHaveText = formData.options.every(opt => opt.text.trim());
        if (!allOptionsHaveText) {
            setError('All options must have text');
            setIsSubmitting(false);
            return;
        }

        try {
            const submitData = {
                questionText: formData.questionText,
                options: formData.options,
                explanation: formData.explanation,
                marks: formData.marks,
            };

            console.log('📤 Sending update data:', submitData);
            console.log('📤 Question image file:', questionImageFile);
            console.log('📤 Explanation image file:', explanationImageFile);

            if (questionImageFile) {
                submitData.questionImage = questionImageFile;
            }
            if (explanationImageFile) {
                submitData.explanationImage = explanationImageFile;
            }

            await updateQuestionMutation.mutateAsync(submitData);
        } catch (err) {
            console.error('❌ Error updating question:', err);
        }
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/question-banks/${bankId}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
                        <p className="text-gray-500 mt-1">Update question details and images</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="info">{formData.marks || 1} Mark{formData.marks > 1 ? 's' : ''}</Badge>
                    {questionImagePreview && (
                        <Badge variant="success" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Has Image
                        </Badge>
                    )}
                    {explanationImagePreview && (
                        <Badge variant="warning" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Has Explanation
                        </Badge>
                    )}
                    {hasChanges && (
                        <Badge variant="primary">Unsaved Changes</Badge>
                    )}
                </div>
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
                        {/* Question Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Text <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.questionText}
                                onChange={(e) => {
                                    setFormData({ ...formData, questionText: e.target.value });
                                    setHasChanges(true);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                placeholder="Enter question text"
                                rows="3"
                                required
                            />
                        </div>

                        {/* Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Options <span className="text-red-500">*</span>
                            </label>
                            {formData.options.map((opt, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={opt.text}
                                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                        placeholder={`Option ${index + 1}`}
                                        required
                                    />
                                    <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={opt.isCorrect}
                                            onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        Correct
                                    </label>
                                    {formData.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {formData.options.length < 6 && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Option
                                </button>
                            )}
                        </div>

                        {/* Explanation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Explanation
                            </label>
                            <textarea
                                value={formData.explanation}
                                onChange={(e) => {
                                    setFormData({ ...formData, explanation: e.target.value });
                                    setHasChanges(true);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                placeholder="Enter explanation (optional)"
                                rows="2"
                            />
                        </div>

                        {/* Marks */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marks
                            </label>
                            <input
                                type="number"
                                value={formData.marks}
                                onChange={(e) => {
                                    setFormData({ ...formData, marks: parseInt(e.target.value) || 1 });
                                    setHasChanges(true);
                                }}
                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                min="1"
                                max="10"
                            />
                        </div>
                    </div>
                </Card>

                {/* Images Section */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Question Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question Image
                            </label>
                            {questionImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={questionImagePreview}
                                        alt="Question"
                                        className="w-full max-h-48 object-contain border border-gray-200 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeQuestionImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleQuestionImageUpload}
                                        className="hidden"
                                        id="questionImageInput"
                                    />
                                    <label htmlFor="questionImageInput" className="cursor-pointer block">
                                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload question image</p>
                                        <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 2MB</p>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Explanation Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Explanation Image
                            </label>
                            {explanationImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={explanationImagePreview}
                                        alt="Explanation"
                                        className="w-full max-h-48 object-contain border border-gray-200 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeExplanationImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleExplanationImageUpload}
                                        className="hidden"
                                        id="explanationImageInput"
                                    />
                                    <label htmlFor="explanationImageInput" className="cursor-pointer block">
                                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload explanation image</p>
                                        <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 2MB</p>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                    <Link to={`/admin/question-banks/${bankId}`} className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !hasChanges}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Update Question
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}