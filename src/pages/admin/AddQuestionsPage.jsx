import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, Save, X, Upload,
    AlertCircle, CheckCircle, Image as ImageIcon, FileText,
    ImagePlus, XCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { questionBankService } from '../../services/questionBankService';

export default function AddQuestionsPage() {
    const { id: bankId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [questions, setQuestions] = useState([
        {
            questionText: '',
            questionImage: null,
            questionImagePreview: null,
            options: [
                { text: '', isCorrect: false, image: null, imagePreview: null },
                { text: '', isCorrect: false, image: null, imagePreview: null },
                { text: '', isCorrect: false, image: null, imagePreview: null },
                { text: '', isCorrect: false, image: null, imagePreview: null },
            ],
            explanation: '',
            explanationImage: null,
            explanationImagePreview: null,
            marks: 1,
        }
    ]);
    const [globalQuestionImages, setGlobalQuestionImages] = useState([]);
    const [globalExplanationImages, setGlobalExplanationImages] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ Add questions mutation with better handling
    const addQuestionsMutation = useMutation({
        mutationFn: async (data) => {
            console.log('📤 Sending questions data:', data);

            // Prepare the questions without image files (they'll be sent separately)
            const questionsData = data.questions.map(q => ({
                questionText: q.questionText || '',
                options: q.options.map(opt => ({
                    text: opt.text || '',
                    isCorrect: opt.isCorrect || false,
                })),
                explanation: q.explanation || '',
                marks: q.marks || 1,
            }));

            // Collect images
            const questionImages = [];
            const explanationImages = [];

            // Collect images from questions
            data.questions.forEach(q => {
                if (q.questionImage instanceof File) {
                    questionImages.push(q.questionImage);
                }
                if (q.explanationImage instanceof File) {
                    explanationImages.push(q.explanationImage);
                }
                q.options.forEach(opt => {
                    if (opt.image instanceof File) {
                        questionImages.push(opt.image);
                    }
                });
            });

            // Add global images
            data.questionImages?.forEach(img => {
                if (img instanceof File) {
                    questionImages.push(img);
                }
            });
            data.explanationImages?.forEach(img => {
                if (img instanceof File) {
                    explanationImages.push(img);
                }
            });

            // Check if we have too many images
            if (questionImages.length > 10 || explanationImages.length > 10) {
                console.warn('⚠️ Many images detected:', {
                    questionImages: questionImages.length,
                    explanationImages: explanationImages.length
                });
            }

            // Call the service with a timeout
            const response = await questionBankService.addQuestions(bankId, {
                questions: questionsData,
                questionImages: questionImages,
                explanationImages: explanationImages,
            });

            console.log('📥 Response:', response);
            return response;
        },
        onSuccess: (response) => {
            console.log('✅ Questions added successfully:', response);
            queryClient.invalidateQueries(['question-bank', bankId]);
            queryClient.invalidateQueries(['question-banks']);
            setSuccess('Questions added successfully!');
            setIsSubmitting(false);
            setTimeout(() => {
                navigate(`/admin/question-banks/${bankId}`);
            }, 1500);
        },
        onError: (error) => {
            console.error('❌ Error adding questions:', error);

            // Handle specific error messages
            let errorMessage = 'Failed to add questions. ';
            if (error.message?.includes('timeout')) {
                errorMessage += 'The request timed out. Please try with fewer questions or smaller images.';
            } else if (error.message?.includes('Network Error')) {
                errorMessage += 'Network error. Please check your connection and try again.';
            } else if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else {
                errorMessage += error.message || 'Unknown error occurred.';
            }

            setError(errorMessage);
            setIsSubmitting(false);
            setTimeout(() => setError(''), 5000);
        },
    });

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                questionText: '',
                questionImage: null,
                questionImagePreview: null,
                options: [
                    { text: '', isCorrect: false, image: null, imagePreview: null },
                    { text: '', isCorrect: false, image: null, imagePreview: null },
                    { text: '', isCorrect: false, image: null, imagePreview: null },
                    { text: '', isCorrect: false, image: null, imagePreview: null },
                ],
                explanation: '',
                explanationImage: null,
                explanationImagePreview: null,
                marks: 1,
            }
        ]);
    };

    const removeQuestion = (index) => {
        if (questions.length === 1) {
            setError('You must have at least one question');
            setTimeout(() => setError(''), 3000);
            return;
        }
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleQuestionImageUpload = (questionIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newQuestions = [...questions];
                newQuestions[questionIndex].questionImage = file;
                newQuestions[questionIndex].questionImagePreview = reader.result;
                setQuestions(newQuestions);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const removeQuestionImage = (questionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].questionImage = null;
        newQuestions[questionIndex].questionImagePreview = null;
        setQuestions(newQuestions);
    };

    const handleOptionImageUpload = (questionIndex, optionIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newQuestions = [...questions];
                newQuestions[questionIndex].options[optionIndex].image = file;
                newQuestions[questionIndex].options[optionIndex].imagePreview = reader.result;
                setQuestions(newQuestions);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const removeOptionImage = (questionIndex, optionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex].image = null;
        newQuestions[questionIndex].options[optionIndex].imagePreview = null;
        setQuestions(newQuestions);
    };

    const updateOption = (questionIndex, optionIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex][field] = value;
        setQuestions(newQuestions);
    };

    const addOption = (questionIndex) => {
        const newQuestions = [...questions];
        if (newQuestions[questionIndex].options.length < 6) {
            newQuestions[questionIndex].options.push({
                text: '',
                isCorrect: false,
                image: null,
                imagePreview: null
            });
            setQuestions(newQuestions);
        }
    };

    const removeOption = (questionIndex, optionIndex) => {
        const newQuestions = [...questions];
        if (newQuestions[questionIndex].options.length > 2) {
            newQuestions[questionIndex].options.splice(optionIndex, 1);
            setQuestions(newQuestions);
        } else {
            setError('Question must have at least 2 options');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleGlobalQuestionImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setGlobalQuestionImages([...globalQuestionImages, ...files]);
        e.target.value = '';
    };

    const handleGlobalExplanationImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setGlobalExplanationImages([...globalExplanationImages, ...files]);
        e.target.value = '';
    };

    const removeGlobalQuestionImage = (index) => {
        const newFiles = [...globalQuestionImages];
        newFiles.splice(index, 1);
        setGlobalQuestionImages(newFiles);
    };

    const removeGlobalExplanationImage = (index) => {
        const newFiles = [...globalExplanationImages];
        newFiles.splice(index, 1);
        setGlobalExplanationImages(newFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        console.log('📝 Form submitted with questions:', questions);

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            // Check if question has either text or image
            if (!q.questionText.trim() && !q.questionImage) {
                setError(`Question ${i + 1} must have either text or an image`);
                setIsSubmitting(false);
                return;
            }

            // Validate options
            for (let j = 0; j < q.options.length; j++) {
                const opt = q.options[j];
                if (!opt.text.trim() && !opt.image) {
                    setError(`Option ${j + 1} in Question ${i + 1} must have either text or an image`);
                    setIsSubmitting(false);
                    return;
                }
            }

            const hasCorrect = q.options.some(opt => opt.isCorrect);
            if (!hasCorrect) {
                setError(`Question ${i + 1} must have at least one correct option`);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            await addQuestionsMutation.mutateAsync({
                questions: questions,
                questionImages: globalQuestionImages,
                explanationImages: globalExplanationImages,
            });
        } catch (err) {
            console.error('❌ Error submitting form:', err);
            // Error is already handled by the mutation
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/question-banks/${bankId}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add Questions</h1>
                        <p className="text-gray-500 mt-1">Add new questions with text and/or images</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="info" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {questions.length} Questions
                    </Badge>
                    <Badge variant="success" className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {globalQuestionImages.length} Question Images
                    </Badge>
                    <Badge variant="warning" className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {globalExplanationImages.length} Explanation Images
                    </Badge>
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
                {/* Questions */}
                {questions.map((q, qIndex) => (
                    <Card key={qIndex} className="p-6 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        Question {qIndex + 1}
                                    </span>
                                </h3>
                                {q.questionImage && (
                                    <Badge variant="success" className="flex items-center gap-1">
                                        <ImageIcon className="h-3 w-3" />
                                        Has Image
                                    </Badge>
                                )}
                                {q.options.some(opt => opt.image) && (
                                    <Badge variant="warning" className="flex items-center gap-1">
                                        <ImageIcon className="h-3 w-3" />
                                        Image Options
                                    </Badge>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove question"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Question Text & Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question <span className="text-red-500">*</span>
                                    <span className="text-xs text-gray-400 ml-2">(Text or Image or Both)</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <textarea
                                            value={q.questionText}
                                            onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                            placeholder="Enter question text (optional)"
                                            rows="2"
                                        />
                                    </div>
                                    <div>
                                        {q.questionImagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={q.questionImagePreview}
                                                    alt="Question"
                                                    className="w-full max-h-32 object-contain border border-gray-200 rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestionImage(qIndex)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleQuestionImageUpload(qIndex, e)}
                                                    className="hidden"
                                                    id={`question-image-${qIndex}`}
                                                />
                                                <label htmlFor={`question-image-${qIndex}`} className="cursor-pointer block">
                                                    <ImagePlus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                                    <p className="text-xs text-gray-500">Upload question image</p>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Options with Image Support */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Options <span className="text-red-500">*</span>
                                    <span className="text-xs text-gray-400 ml-2">(Text or Image or Both for each option)</span>
                                </label>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-start gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                                placeholder={`Option ${oIndex + 1} text`}
                                            />
                                            <div className="flex items-center gap-2">
                                                {opt.imagePreview ? (
                                                    <div className="relative flex items-center">
                                                        <img
                                                            src={opt.imagePreview}
                                                            alt={`Option ${oIndex + 1}`}
                                                            className="h-10 w-10 object-cover rounded border border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOptionImage(qIndex, oIndex)}
                                                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                        >
                                                            <XCircle className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleOptionImageUpload(qIndex, oIndex, e)}
                                                            className="hidden"
                                                            id={`option-image-${qIndex}-${oIndex}`}
                                                        />
                                                        <label htmlFor={`option-image-${qIndex}-${oIndex}`} className="cursor-pointer block">
                                                            <ImagePlus className="h-5 w-5 text-gray-400" />
                                                        </label>
                                                    </div>
                                                )}
                                                <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={opt.isCorrect}
                                                        onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    Correct
                                                </label>
                                            </div>
                                        </div>
                                        {q.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(qIndex, oIndex)}
                                                className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors mt-1"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {q.options.length < 6 && (
                                    <button
                                        type="button"
                                        onClick={() => addOption(qIndex)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Option
                                    </button>
                                )}
                            </div>

                            {/* Explanation with Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Explanation
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <textarea
                                        value={q.explanation}
                                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                        placeholder="Enter explanation (optional)"
                                        rows="2"
                                    />
                                    <div>
                                        {q.explanationImagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={q.explanationImagePreview}
                                                    alt="Explanation"
                                                    className="w-full max-h-32 object-contain border border-gray-200 rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newQuestions = [...questions];
                                                        newQuestions[qIndex].explanationImage = null;
                                                        newQuestions[qIndex].explanationImagePreview = null;
                                                        setQuestions(newQuestions);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                const newQuestions = [...questions];
                                                                newQuestions[qIndex].explanationImage = file;
                                                                newQuestions[qIndex].explanationImagePreview = reader.result;
                                                                setQuestions(newQuestions);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                    className="hidden"
                                                    id={`explanation-image-${qIndex}`}
                                                />
                                                <label htmlFor={`explanation-image-${qIndex}`} className="cursor-pointer block">
                                                    <ImagePlus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                                    <p className="text-xs text-gray-500">Upload explanation image</p>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Marks */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marks
                                </label>
                                <input
                                    type="number"
                                    value={q.marks}
                                    onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 1)}
                                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                    min="1"
                                    max="10"
                                />
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Add Question Button */}
                <Button type="button" variant="outline" onClick={addQuestion} className="w-full py-4 border-dashed">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Another Question
                </Button>

                {/* Global File Uploads Section */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Images (Applied to All Questions)</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Global Question Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Global Question Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGlobalQuestionImageUpload}
                                    className="hidden"
                                    id="globalQuestionImageUpload"
                                />
                                <label htmlFor="globalQuestionImageUpload" className="cursor-pointer block">
                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload global question images</p>
                                    <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 2MB each</p>
                                </label>
                            </div>
                            {globalQuestionImages.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    <p className="text-sm font-medium text-gray-700">Uploaded Images:</p>
                                    {globalQuestionImages.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg">
                                            <span className="text-gray-600 truncate">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeGlobalQuestionImage(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Global Explanation Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Global Explanation Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGlobalExplanationImageUpload}
                                    className="hidden"
                                    id="globalExplanationImageUpload"
                                />
                                <label htmlFor="globalExplanationImageUpload" className="cursor-pointer block">
                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload global explanation images</p>
                                    <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 2MB each</p>
                                </label>
                            </div>
                            {globalExplanationImages.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    <p className="text-sm font-medium text-gray-700">Uploaded Images:</p>
                                    {globalExplanationImages.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg">
                                            <span className="text-gray-600 truncate">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeGlobalExplanationImage(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
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
                        disabled={isSubmitting || questions.length === 0}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save {questions.length} Question{questions.length > 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}