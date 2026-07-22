import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { stateService } from '../../services/stateService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const stateSchema = z.object({
    name: z.string().min(2, 'State name is required'),
    code: z.string().length(2, 'State code must be 2 characters'),
});

export default function StatesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingState, setEditingState] = useState(null);

    const queryClient = useQueryClient();

    const { data: states = [] } = useQuery({
        queryKey: ['states'],
        queryFn: stateService.getAll,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(stateSchema),
    });

    const createMutation = useMutation({
        mutationFn: stateService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['states']);
            setIsModalOpen(false);
            reset();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => stateService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['states']);
            setIsModalOpen(false);
            setEditingState(null);
            reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: stateService.delete,
        onSuccess: () => queryClient.invalidateQueries(['states']),
    });

    const handleEdit = (state) => {
        setEditingState(state);
        reset(state);
        setIsModalOpen(true);
    };

    const handleDelete = (stateId) => {
        if (window.confirm('Are you sure you want to delete this state?')) {
            deleteMutation.mutate(stateId);
        }
    };

    const onSubmit = (data) => {
        if (editingState) {
            updateMutation.mutate({ id: editingState.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">States</h1>
                    <p className="text-gray-600 mt-1">Manage US states</p>
                </div>
                <Button
                    icon={Plus}
                    onClick={() => {
                        setEditingState(null);
                        reset({});
                        setIsModalOpen(true);
                    }}
                >
                    Add State
                </Button>
            </div>

            <Card padding={false}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>State</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {states.map((state) => (
                            <TableRow key={state.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-primary-600" />
                                        <span className="font-medium">{state.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="primary">{state.code}</Badge>
                                </TableCell>
                                <TableCell>{state.questionsCount} questions</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(state)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(state.id)}
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
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingState(null);
                    reset();
                }}
                title={editingState ? 'Edit State' : 'Add State'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="State Name"
                        {...register('name')}
                        error={errors.name?.message}
                        placeholder="e.g., California"
                    />
                    <Input
                        label="State Code"
                        {...register('code')}
                        error={errors.code?.message}
                        placeholder="e.g., CA"
                        maxLength={2}
                    />
                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingState ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};