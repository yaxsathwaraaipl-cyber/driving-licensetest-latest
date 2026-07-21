import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { categoryService } from '../../services/categoryService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().min(10, 'Description is required'),
});

export default function CategoriesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const queryClient = useQueryClient();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(categorySchema),
    });

    const createMutation = useMutation({
        mutationFn: categoryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            setIsModalOpen(false);
            reset();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => categoryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            setIsModalOpen(false);
            setEditingCategory(null);
            reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: categoryService.delete,
        onSuccess: () => queryClient.invalidateQueries(['categories']),
    });

    const handleEdit = (category) => {
        setEditingCategory(category);
        reset(category);
        setIsModalOpen(true);
    };

    const handleDelete = (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteMutation.mutate(categoryId);
        }
    };

    const onSubmit = (data) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600 mt-1">Manage question categories</p>
                </div>
                <Button
                    icon={Plus}
                    onClick={() => {
                        setEditingCategory(null);
                        reset({});
                        setIsModalOpen(true);
                    }}
                >
                    Add Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Card key={category.id} hover>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-100 rounded-lg">
                                <FolderTree className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                        <div className="flex items-center justify-between">
                            <Badge variant="info">{category.questionsCount} questions</Badge>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    reset();
                }}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Category Name"
                        {...register('name')}
                        error={errors.name?.message}
                        placeholder="e.g., Road Signs"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="input-field"
                            placeholder="Describe this category..."
                        />
                        {errors.description?.message && (
                            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
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
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};