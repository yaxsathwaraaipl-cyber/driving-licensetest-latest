import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { stateService } from '../../services/stateService';
import { countryService } from '../../services/countryService';
import { useAuthStore } from '../../store/authStore';
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
    const [selectedCountryId, setSelectedCountryId] = useState('');

    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    // Fetch countries
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: countryService.getAll,
    });

    // Fetch provinces (as "states")
    const { data: states = [], isLoading } = useQuery({
        queryKey: ['states'],
        queryFn: stateService.getAll,
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(stateSchema),
        defaultValues: { name: '', code: '' },
    });

    // When editing, populate the form and country select
    useEffect(() => {
        if (editingState) {
            reset({ name: editingState.name, code: editingState.code });
            // Ensure countryId is set from the state object (if available)
            setSelectedCountryId(editingState.countryId || '');
        } else {
            reset({ name: '', code: '' });
            // Pre-fill with admin's country if available
            setSelectedCountryId(user?.countryId?._id || user?.countryId || '');
        }
    }, [editingState, reset, user]);

    const createMutation = useMutation({
        mutationFn: (data) => stateService.create({ ...data, countryId: selectedCountryId }),
        onSuccess: () => {
            queryClient.invalidateQueries(['states']);
            setIsModalOpen(false);
            setEditingState(null);
            reset();
            setSelectedCountryId('');
        },
        onError: (error) => {
            alert('Create failed: ' + (error.response?.data?.message || error.message));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => stateService.update(id, { ...data, countryId: selectedCountryId }),
        onSuccess: () => {
            queryClient.invalidateQueries(['states']);
            setIsModalOpen(false);
            setEditingState(null);
            reset();
            setSelectedCountryId('');
        },
        onError: (error) => {
            alert('Update failed: ' + (error.response?.data?.message || error.message));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: stateService.delete,
        onSuccess: () => queryClient.invalidateQueries(['states']),
        onError: (error) => {
            alert('Delete failed: ' + (error.response?.data?.message || error.message));
        },
    });

    const handleEdit = (state) => {
        setEditingState(state);
        setIsModalOpen(true);
    };

    const handleDelete = (stateId) => {
        if (window.confirm('Are you sure you want to delete this state?')) {
            deleteMutation.mutate(stateId);
        }
    };

    const onSubmit = (data) => {
        if (!selectedCountryId) {
            alert('Please select a country.');
            return;
        }

        // Include code as part of data (though backend may ignore it)
        const payload = { ...data, countryId: selectedCountryId };

        if (editingState) {
            updateMutation.mutate({ id: editingState.id, data: payload });
        } else {
            createMutation.mutate(payload);
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
                    <h1 className="text-2xl font-bold text-gray-900">Province Master</h1>
                    <p className="text-gray-600 mt-1">Manage provinces/states</p>
                </div>
                <Button
                    icon={Plus}
                    onClick={() => {
                        setEditingState(null);
                        setIsModalOpen(true);
                    }}
                >
                    Add Province
                </Button>
            </div>

            <Card padding={false}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
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
                                <TableCell>{state.questionsCount || 0} questions</TableCell>
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
                    setSelectedCountryId('');
                }}
                title={editingState ? 'Edit Province' : 'Add Province'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Province Name"
                        {...register('name')}
                        error={errors.name?.message}
                        placeholder="e.g., California"
                    />
                    <Input
                        label="Province Code"
                        {...register('code')}
                        error={errors.code?.message}
                        placeholder="e.g., CA"
                        maxLength={2}
                    />
                    <Select
                        label="Country"
                        value={selectedCountryId}
                        onChange={(e) => setSelectedCountryId(e.target.value)}
                        options={countries.map(c => ({
                            value: c._id || c.id,
                            label: c.name,
                        }))}
                        placeholder="Select a country"
                    />
                    {!selectedCountryId && (
                        <p className="text-sm text-red-600">Please select a country</p>
                    )}
                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingState(null);
                                reset();
                                setSelectedCountryId('');
                            }}
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
}