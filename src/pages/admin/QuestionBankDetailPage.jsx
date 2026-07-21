import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Edit, Trash2, AlertCircle, CheckCircle,
    BookOpen, Image, FileText, ChevronLeft, ChevronRight,
    List, Globe, MapPin,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { questionBankService } from '../../services/questionBankService';
import { testCategoryService } from '../../services/testCategoryService'; // ✅ Add this import

export default function QuestionBankDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const itemsPerPage = 10;

    // ✅ Fetch test categories for category details
    const { data: testCategories } = useQuery({
        queryKey: ['test-categories'],
        queryFn: testCategoryService.getAll,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    // Fetch question bank details
    const { data: bank, isLoading } = useQuery({
        queryKey: ['question-bank', id],
        queryFn: () => questionBankService.getById(id),
        retry: 2,
        retryDelay: 1000,
    });

    // ✅ Get category title from ID
    const getCategoryTitle = (categoryId) => {
        if (!categoryId) return 'No Category';

        // Extract ID if it's an object
        let actualId = categoryId;
        if (typeof categoryId === 'object' && categoryId !== null) {
            actualId = categoryId._id || categoryId.id || '';
        }

        const searchId = String(actualId);
        const category = testCategories?.find(c => {
            const cId = String(c._id || c.id || '');
            return cId === searchId;
        });

        return category?.title || 'Unknown Category';
    };

    // ✅ Get category details with country and province
    const getCategoryDetails = (categoryId) => {
        if (!categoryId) return { name: 'No Category', country: null, province: null };

        let actualId = categoryId;
        if (typeof categoryId === 'object' && categoryId !== null) {
            actualId = categoryId._id || categoryId.id || '';
        }

        const searchId = String(actualId);
        const category = testCategories?.find(c => {
            const cId = String(c._id || c.id || '');
            return cId === searchId;
        });

        if (category) {
            return {
                name: category.title || 'Unknown Category',
                country: category.countryId?.name || null,
                province: category.provinceId?.name || null
            };
        }

        return { name: 'Unknown Category', country: null, province: null };
    };

    // Delete question mutation
    const deleteQuestionMutation = useMutation({
        mutationFn: ({ bankId, questionId }) => questionBankService.deleteQuestion(bankId, questionId),
        onSuccess: () => {
            queryClient.invalidateQueries(['question-bank', id]);
            setSuccess('Question deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete question');
            setTimeout(() => setError(''), 3000);
        },
    });

    const handleDeleteQuestion = (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            deleteQuestionMutation.mutate({ bankId: id, questionId });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!bank) {
        return (
            <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Question bank not found</h3>
                    <Button onClick={() => navigate('/admin/question-banks')} className="mt-4">Go Back</Button>
                </div>
            </Card>
        );
    }

    const questions = bank.questions || [];
    const totalPages = Math.ceil(questions.length / itemsPerPage);
    const paginatedQuestions = questions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Get category details
    const categoryDetails = getCategoryDetails(bank.testCategoryId);

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
                <div className="flex items-center gap-4">
                    <Link to="/admin/question-banks" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{bank.title}</h1>
                        <p className="text-gray-500 mt-1">{bank.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="info" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {questions.length} Questions
                            </Badge>
                            {bank.testCategoryId && (
                                <Badge variant="primary" className="flex items-center gap-1">
                                    <List className="h-3 w-3" />
                                    {categoryDetails.name}
                                </Badge>
                            )}
                            {categoryDetails.country && (
                                <Badge variant="success" className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {categoryDetails.country}
                                </Badge>
                            )}
                            {categoryDetails.province && (
                                <Badge variant="warning" className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {categoryDetails.province}
                                </Badge>
                            )}
                            {questions.some(q => q.questionImage) && (
                                <Badge variant="success" className="flex items-center gap-1">
                                    <Image className="h-3 w-3" />
                                    Has Images
                                </Badge>
                            )}
                            {bank.isActive ? (
                                <Badge variant="success">Active</Badge>
                            ) : (
                                <Badge variant="danger">Inactive</Badge>
                            )}
                        </div>
                    </div>
                </div>
                <Link to={`/admin/question-banks/${id}/questions/add`}>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Questions
                    </Button>
                </Link>
            </div>

            {/* Questions List */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
                    <span className="text-sm text-gray-500">Total: {questions.length} questions</span>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No questions in this bank yet.</p>
                        <Link to={`/admin/question-banks/${id}/questions/add`}>
                            <Button className="mt-4">Add Questions</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {paginatedQuestions.map((question, index) => {
                                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                const hasImage = !!question.questionImage;
                                const hasExplanationImage = !!question.explanationImage;

                                return (
                                    <div key={question._id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-sm font-medium text-gray-500">#{globalIndex}</span>
                                                    <p className="text-sm text-gray-900">{question.questionText}</p>
                                                </div>

                                                <div className="mt-2 space-y-1">
                                                    {question.options?.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-2 text-sm">
                                                            <span className={`px-2 py-0.5 rounded ${opt.isCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {opt.isCorrect ? '✓' : '○'} {opt.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {question.explanation && (
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        <span className="font-medium">Explanation:</span> {question.explanation}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                    <Badge variant="info">{question.marks || 1} mark{question.marks > 1 ? 's' : ''}</Badge>
                                                    {hasImage && (
                                                        <Badge variant="success" className="flex items-center gap-1">
                                                            <Image className="h-3 w-3" />
                                                            Question Image
                                                        </Badge>
                                                    )}
                                                    {hasExplanationImage && (
                                                        <Badge variant="warning" className="flex items-center gap-1">
                                                            <Image className="h-3 w-3" />
                                                            Explanation Image
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 ml-4">
                                                <Link
                                                    to={`/admin/question-banks/${id}/questions/${question._id}/edit`}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteQuestion(question._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-gray-500">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                    {Math.min(currentPage * itemsPerPage, questions.length)} of {questions.length} questions
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
            </Card>
        </div>
    );
}