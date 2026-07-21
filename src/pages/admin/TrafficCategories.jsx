import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Save, X, AlertCircle, List } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { categoryService } from '../../services/categoryService';

export default function TrafficCategories() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    // Fetch categories
    const { data: categories, isLoading } = useQuery({
        queryKey: ['traffic-categories'],
        queryFn: categoryService.getAll,
    });

    // Create category mutation
    const createMutation = useMutation({
        mutationFn: categoryService.create,
        onSuccess: (response) => {
            queryClient.invalidateQueries(['traffic-categories']);
            closeModal();
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to create category');
        },
    });

    // Update category mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => categoryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['traffic-categories']);
            closeModal();
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to update category');
        },
    });

    // Delete category mutation
    const deleteMutation = useMutation({
        mutationFn: categoryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['traffic-categories']);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete category');
        },
    });

    const openModal = (category = null) => {
        setError('');
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }

        if (editingCategory) {
            updateMutation.mutate({
                id: editingCategory._id || editingCategory.id,
                data: formData,
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteMutation.mutate(id);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Traffic Sign Categories</h1>
                    <p className="text-gray-500 mt-1">Manage traffic sign categories for the system</p>
                </div>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {categories?.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No categories yet</h3>
                        <p className="text-gray-500 mt-2">Create your first traffic sign category to get started.</p>
                        <Button onClick={() => openModal()} className="mt-4">
                            Create Category
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories?.map((category) => (
                        <Card key={category._id || category.id} className="p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                    {category.description && (
                                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                                    )}
                                    <Badge variant="info" className="mt-2">
                                        {category.signsCount || 0} signs
                                    </Badge>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openModal(category)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id || category.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    placeholder="Enter category name"
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
                                    placeholder="Enter description (optional)"
                                    rows="3"
                                />
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
                                            {editingCategory ? 'Update' : 'Create'}
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