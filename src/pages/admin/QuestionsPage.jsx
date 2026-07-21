import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { questionService } from '../../services/questionService';
import { categoryService } from '../../services/categoryService';
import { stateService } from '../../services/stateService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const questionSchema = z.object({
    question: z.string().min(10, 'Question is required'),
    categoryId: z.string().min(1, 'Category is required'),
    stateId: z.string().min(1, 'State is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    options: z.array(z.string()).length(4, '4 options required'),
    correctAnswer: z.number().min(0).max(3),
    explanation: z.string().min(10, 'Explanation is required'),
});

export default function QuestionsPage() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const itemsPerPage = 10;

    const queryClient = useQueryClient();

    const { data: questions = [] } = useQuery({
        queryKey: ['questions', search, categoryFilter, difficultyFilter],
        queryFn: () => questionService.getAll({ search, categoryId: categoryFilter, difficulty: difficultyFilter }),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll,
    });

    const { data: states = [] } = useQuery({
        queryKey: ['states'],
        queryFn: stateService.getAll,
    });

    const totalPages = Math.ceil(questions.length / itemsPerPage);
    const paginatedQuestions = questions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(questionSchema),
    });

    const createMutation = useMutation({
        mutationFn: questionService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['questions']);
            setIsModalOpen(false);
            reset();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => questionService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['questions']);
            setIsModalOpen(false);
            setEditingQuestion(null);
            reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: questionService.delete,
        onSuccess: () => queryClient.invalidateQueries(['questions']),
    });

    const handleEdit = (question) => {
        setEditingQuestion(question);
        reset(question);
        setIsModalOpen(true);
    };

    const handleDelete = (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            deleteMutation.mutate(questionId);
        }
    };

    const onSubmit = (data) => {
        if (editingQuestion) {
            updateMutation.mutate({ id: editingQuestion.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const getCategoryName = (id) => {
        return categories.find(c => c.id === id)?.name || 'Unknown';
    };

    const getStateName = (id) => {
        return states.find(s => s.id === id)?.name || 'Unknown';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
                    <p className="text-gray-600 mt-1">Manage test questions</p>
                </div>
                <Button
                    icon={Plus}
                    onClick={() => {
                        setEditingQuestion(null);
                        reset({
                            options: ['', '', '', ''],
                            correctAnswer: 0,
                        });
                        setIsModalOpen(true);
                    }}
                >
                    Add Question
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search questions..."
                        />
                    </div>
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                        className="w-full sm:w-48"
                    />
                    <Select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        options={[
                            { value: 'easy', label: 'Easy' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'hard', label: 'Hard' },
                        ]}
                        className="w-full sm:w-48"
                    />
                </div>
            </Card>

            {/* Questions Table */}
            <Card padding={false}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedQuestions.map((question) => (
                            <TableRow key={question.id}>
                                <TableCell className="max-w-xs">
                                    <p className="truncate">{question.question}</p>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="info">{getCategoryName(question.categoryId)}</Badge>
                                </TableCell>
                                <TableCell>{getStateName(question.stateId)}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            question.difficulty === 'easy' ? 'success' :
                                                question.difficulty === 'medium' ? 'warning' : 'danger'
                                        }
                                    >
                                        {question.difficulty}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(question)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(question.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={questions.length}
                    itemsPerPage={itemsPerPage}
                />
            </Card>

            {/* Add/Edit Question Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingQuestion(null);
                    reset();
                }}
                title={editingQuestion ? 'Edit Question' : 'Add Question'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question
                        </label>
                        <textarea
                            {...register('question')}
                            rows={3}
                            className="input-field"
                            placeholder="Enter your question..."
                        />
                        {errors.question?.message && (
                            <p className="text-sm text-red-600 mt-1">{errors.question.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Category"
                            {...register('categoryId')}
                            error={errors.categoryId?.message}
                            options={categories.map(c => ({ value: c.id, label: c.name }))}
                        />
                        <Select
                            label="State"
                            {...register('stateId')}
                            error={errors.stateId?.message}
                            options={states.map(s => ({ value: s.id, label: s.name }))}
                        />
                    </div>

                    <Select
                        label="Difficulty"
                        {...register('difficulty')}
                        error={errors.difficulty?.message}
                        options={[
                            { value: 'easy', label: 'Easy' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'hard', label: 'Hard' },
                        ]}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                        </label>
                        <div className="space-y-2">
                            {[0, 1, 2, 3].map((index) => (
                                <Input
                                    key={index}
                                    {...register(`options.${index}`)}
                                    placeholder={`Option ${index + 1}`}
                                    error={errors.options?.[index]?.message}
                                />
                            ))}
                        </div>
                    </div>

                    <Select
                        label="Correct Answer"
                        {...register('correctAnswer', { valueAsNumber: true })}
                        error={errors.correctAnswer?.message}
                        options={[
                            { value: '0', label: 'Option 1' },
                            { value: '1', label: 'Option 2' },
                            { value: '2', label: 'Option 3' },
                            { value: '3', label: 'Option 4' },
                        ]}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Explanation
                        </label>
                        <textarea
                            {...register('explanation')}
                            rows={3}
                            className="input-field"
                            placeholder="Explain why this answer is correct..."
                        />
                        {errors.explanation?.message && (
                            <p className="text-sm text-red-600 mt-1">{errors.explanation.message}</p>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingQuestion ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};