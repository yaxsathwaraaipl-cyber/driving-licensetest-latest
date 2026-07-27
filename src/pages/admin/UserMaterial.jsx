// pages/admin/UserMaterial.jsx
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, Edit, Trash2, Save, X, AlertCircle, 
    Package, Upload, CheckCircle, Search, User, Book, Clock,
    FileText, Video, Image, File, Download, Eye, 
    FolderOpen, MessageSquare, ExternalLink
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { userMaterialService } from '../../services/userMaterialService';
import { getMaterials } from '../../store/materialStore';

// Mock users
const MOCK_USERS = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
];

const MOCK_MATERIALS = [
    { id: '1', name: 'Driver\'s Handbook 2024', type: 'pdf', category: 'handbook' },
    { id: '2', name: 'Traffic Rules Video', type: 'video', category: 'video' },
    { id: '3', name: 'Practice Questions', type: 'document', category: 'practice' },
    { id: '4', name: 'Road Signs Guide', type: 'image', category: 'signs' },
];

export default function UserMaterial() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [viewingMaterial, setViewingMaterial] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [formData, setFormData] = useState({
        userId: '',
        materialId: '',
        quantity: 1,
        status: 'active',
        notes: '',
        customNotes: '',
        image: null,
        imageUrl: '',
        document: null,
        documentUrl: '',
        video: null,
        videoUrl: '',
        additionalFiles: [],
        additionalFileUrls: [],
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [documentName, setDocumentName] = useState('');
    const [videoName, setVideoName] = useState('');
    const [additionalFilesList, setAdditionalFilesList] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [materials, setMaterials] = useState([]);
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const docInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const additionalInputRef = useRef(null);

    // Load materials from store
    useEffect(() => {
        const loadMaterials = () => {
            const data = getMaterials();
            setMaterials(data);
        };
        loadMaterials();
        // Listen for storage changes
        window.addEventListener('storage', loadMaterials);
        return () => window.removeEventListener('storage', loadMaterials);
    }, []);

    // Fetch user materials with real-time updates
    const { data: userMaterials, isLoading, refetch } = useQuery({
        queryKey: ['userMaterials'],
        queryFn: async () => {
            const data = await userMaterialService.getAll();
            setMaterials(data);
            return data;
        },
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: userMaterialService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['userMaterials']);
            setSuccess('Material assigned successfully!');
            refetch();
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to assign material');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => userMaterialService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['userMaterials']);
            setSuccess('Material updated successfully!');
            refetch();
            closeModal();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to update material');
            setTimeout(() => setError(''), 3000);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: userMaterialService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['userMaterials']);
            setSuccess('Material deleted successfully!');
            refetch();
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete material');
            setTimeout(() => setError(''), 3000);
        },
    });

    const openModal = (material = null) => {
        setError('');
        setImagePreview(null);
        setDocumentName('');
        setVideoName('');
        setAdditionalFilesList([]);
        
        if (material) {
            setEditingMaterial(material);
            setFormData({
                userId: material.userId || '',
                materialId: material.materialId || '',
                quantity: material.quantity || 1,
                status: material.status || 'active',
                notes: material.notes || '',
                customNotes: material.customNotes || '',
                image: null,
                imageUrl: material.imageUrl || material.image || '',
                document: null,
                documentUrl: material.documentUrl || material.document || '',
                video: null,
                videoUrl: material.videoUrl || material.video || '',
                additionalFiles: [],
                additionalFileUrls: material.additionalFileUrls || material.additionalFiles || [],
            });
            
            if (material.image || material.imageUrl) {
                setImagePreview(material.image || material.imageUrl);
            }
            if (material.document || material.documentUrl) {
                setDocumentName(material.document || material.documentUrl);
            }
            if (material.video || material.videoUrl) {
                setVideoName(material.video || material.videoUrl);
            }
            if (material.additionalFiles || material.additionalFileUrls) {
                setAdditionalFilesList(material.additionalFiles || material.additionalFileUrls || []);
            }
        } else {
            setEditingMaterial(null);
            setFormData({
                userId: '',
                materialId: '',
                quantity: 1,
                status: 'active',
                notes: '',
                customNotes: '',
                image: null,
                imageUrl: '',
                document: null,
                documentUrl: '',
                video: null,
                videoUrl: '',
                additionalFiles: [],
                additionalFileUrls: [],
            });
        }
        setIsModalOpen(true);
    };

    const openViewModal = (material) => {
        setViewingMaterial(material);
        setIsViewModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMaterial(null);
        setFormData({ 
            userId: '', 
            materialId: '', 
            quantity: 1, 
            status: 'active',
            notes: '', 
            customNotes: '',
            image: null,
            imageUrl: '',
            document: null,
            documentUrl: '',
            video: null,
            videoUrl: '',
            additionalFiles: [],
            additionalFileUrls: [],
        });
        setImagePreview(null);
        setDocumentName('');
        setVideoName('');
        setAdditionalFilesList([]);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (docInputRef.current) docInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
        if (additionalInputRef.current) additionalInputRef.current.value = '';
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewingMaterial(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.userId) {
            setError('Please select a user');
            return;
        }
        if (!formData.materialId) {
            setError('Please select a material');
            return;
        }

        try {
            const submitData = {
                userId: formData.userId,
                materialId: formData.materialId,
                quantity: parseInt(formData.quantity),
                status: formData.status,
                notes: formData.notes || '',
                customNotes: formData.customNotes || '',
                image: formData.image,
                imageUrl: formData.imageUrl,
                document: formData.document,
                documentUrl: formData.documentUrl,
                video: formData.video,
                videoUrl: formData.videoUrl,
                additionalFiles: formData.additionalFiles,
                additionalFileUrls: formData.additionalFileUrls,
            };

            if (editingMaterial) {
                const id = editingMaterial.id || editingMaterial._id;
                await updateMutation.mutateAsync({ id, data: submitData });
            } else {
                await createMutation.mutateAsync(submitData);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, image: file, imageUrl: url });
            setImagePreview(url);
        }
        e.target.value = '';
    };

    const handleDocumentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, document: file, documentUrl: url });
            setDocumentName(file.name);
        }
        e.target.value = '';
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, video: file, videoUrl: url });
            setVideoName(file.name);
        }
        e.target.value = '';
    };

    const handleAdditionalFilesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const urls = files.map(f => URL.createObjectURL(f));
            const names = files.map(f => f.name);
            setFormData({ ...formData, additionalFiles: files, additionalFileUrls: urls });
            setAdditionalFilesList(names);
        }
        e.target.value = '';
    };

    const removeImage = () => {
        setFormData({ ...formData, image: null, imageUrl: '' });
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeDocument = () => {
        setFormData({ ...formData, document: null, documentUrl: '' });
        setDocumentName('');
        if (docInputRef.current) docInputRef.current.value = '';
    };

    const removeVideo = () => {
        setFormData({ ...formData, video: null, videoUrl: '' });
        setVideoName('');
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const removeAdditionalFiles = () => {
        setFormData({ ...formData, additionalFiles: [], additionalFileUrls: [] });
        setAdditionalFilesList([]);
        if (additionalInputRef.current) additionalInputRef.current.value = '';
    };

    // Get user name
    const getUserName = (userId) => {
        if (!userId) return 'N/A';
        const user = MOCK_USERS.find(u => u.id === userId);
        return user?.name || 'Unknown User';
    };

    // Get material details
    const getMaterialDetails = (materialId) => {
        if (!materialId) return null;
        return MOCK_MATERIALS.find(m => m.id === materialId);
    };

    const getMaterialName = (materialId) => {
        const material = getMaterialDetails(materialId);
        return material?.name || 'Unknown Material';
    };

    const getMaterialType = (materialId) => {
        const material = getMaterialDetails(materialId);
        return material?.type || 'file';
    };

    const getMaterialCategory = (materialId) => {
        const material = getMaterialDetails(materialId);
        return material?.category || 'other';
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'pdf': return <FileText className="h-5 w-5" />;
            case 'video': return <Video className="h-5 w-5" />;
            case 'image': return <Image className="h-5 w-5" />;
            case 'document': return <File className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'pdf': return 'bg-red-50 text-red-600 border-red-200';
            case 'video': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'image': return 'bg-green-50 text-green-600 border-green-200';
            case 'document': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getCategoryColor = (category) => {
        switch(category) {
            case 'handbook': return 'bg-blue-50 text-blue-700';
            case 'video': return 'bg-purple-50 text-purple-700';
            case 'practice': return 'bg-green-50 text-green-700';
            case 'signs': return 'bg-yellow-50 text-yellow-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

    // Filter materials
    const filteredMaterials = materials?.filter(material => {
        const search = searchTerm.toLowerCase();
        const materialName = getMaterialName(material.materialId).toLowerCase();
        const userName = getUserName(material.userId).toLowerCase();
        const notes = material.notes?.toLowerCase() || '';
        const customNotes = material.customNotes?.toLowerCase() || '';
        const type = getMaterialType(material.materialId);
        const category = getMaterialCategory(material.materialId);

        const matchesSearch = materialName.includes(search) || 
                            userName.includes(search) || 
                            notes.includes(search) ||
                            customNotes.includes(search);
        const matchesType = filterType === 'all' || type === filterType;
        const matchesCategory = filterCategory === 'all' || category === filterCategory;
        
        return matchesSearch && matchesType && matchesCategory;
    });

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="h-6 w-6 text-blue-600" />
                        User Materials Management
                    </h1>
                    <p className="text-gray-500 mt-1">Assign and manage study materials for users</p>
                </div>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Assign Material
                </Button>
            </div>

            {/* Messages */}
            {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-700">{success}</p>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by user, material, or notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                    >
                        <option value="all">All Types</option>
                        {Array.from(new Set(materials?.map(m => getMaterialType(m.materialId)) || [])).map((type) => (
                            <option key={type} value={type} className="capitalize">{type}</option>
                        ))}
                    </select>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                    >
                        <option value="all">All Categories</option>
                        {Array.from(new Set(materials?.map(m => getMaterialCategory(m.materialId)) || [])).map((category) => (
                            <option key={category} value={category} className="capitalize">{category}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            {materials && materials.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <p className="text-2xl font-bold text-blue-600">{materials.length}</p>
                        <p className="text-sm text-blue-700">Total Assignments</p>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
                        <p className="text-2xl font-bold text-green-600">
                            {materials.filter(m => m.status !== 'inactive').length}
                        </p>
                        <p className="text-sm text-green-700">Active</p>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
                        <p className="text-2xl font-bold text-purple-600">
                            {new Set(materials.map(m => getMaterialType(m.materialId))).size}
                        </p>
                        <p className="text-sm text-purple-700">Material Types</p>
                    </Card>
                    <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100">
                        <p className="text-2xl font-bold text-orange-600">
                            {materials.reduce((sum, m) => sum + (m.quantity || 0), 0)}
                        </p>
                        <p className="text-sm text-orange-700">Total Items</p>
                    </Card>
                </div>
            )}

            {/* Materials Grid */}
            {filteredMaterials?.length === 0 ? (
                <Card className="p-16 text-center">
                    <div className="max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No assignments found</h3>
                        <p className="text-gray-500 mt-2">
                            {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Assign materials to users to get started.'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMaterials?.map((material) => {
                        const id = material.id || material._id;
                        const type = getMaterialType(material.materialId);
                        const category = getMaterialCategory(material.materialId);
                        const userName = getUserName(material.userId);

                        const hasFiles = material.image || material.imageUrl || 
                                       material.document || material.documentUrl ||
                                       material.video || material.videoUrl ||
                                       (material.additionalFiles && material.additionalFiles.length > 0) ||
                                       (material.additionalFileUrls && material.additionalFileUrls.length > 0);

                        return (
                            <Card key={id} className="p-5 hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2.5 rounded-xl ${getTypeColor(type)} border`}>
                                                {getTypeIcon(type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {getMaterialName(material.materialId)}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {userName}
                                                    </span>
                                                    {category && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(category)} capitalize`}>
                                                            {category}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Show custom notes prominently */}
                                                {material.customNotes && (
                                                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                        <p className="text-xs font-medium text-blue-800 flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            User Note
                                                        </p>
                                                        <p className="text-sm text-blue-700">{material.customNotes}</p>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                                                        Qty: {material.quantity || 1}
                                                    </span>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full border ${getTypeColor(type)} capitalize`}>
                                                        {type}
                                                    </span>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full border ${
                                                        material.status === 'active' 
                                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                                    } capitalize`}>
                                                        {material.status || 'active'}
                                                    </span>
                                                    {hasFiles && (
                                                        <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 flex items-center gap-1">
                                                            <FolderOpen className="h-3 w-3" />
                                                            Files
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={() => openViewModal(material)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => openModal(material)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal - Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingMaterial ? 'Edit Assignment' : 'Assign Material'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* User Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select User <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.userId}
                                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    required
                                >
                                    <option value="">Choose a user...</option>
                                    {MOCK_USERS.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Material Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Material <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.materialId}
                                    onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                    required
                                >
                                    <option value="">Choose a material...</option>
                                    {MOCK_MATERIALS.map((material) => (
                                        <option key={material.id} value={material.id}>
                                            {material.name} ({material.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            {/* Internal Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Internal Notes (Admin Only)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all resize-none"
                                    rows="2"
                                    placeholder="Internal notes (only visible to admin)..."
                                />
                            </div>

                            {/* Custom Notes - Visible to User */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes for User <span className="text-blue-500">(visible to user)</span>
                                </label>
                                <textarea
                                    value={formData.customNotes}
                                    onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all resize-none"
                                    rows="2"
                                    placeholder="Notes that the user will see..."
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image / Thumbnail
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload image</p>
                                        </div>
                                    </div>
                                    {imagePreview && (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Document Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Document / PDF
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => docInputRef.current?.click()}
                                        >
                                            <input
                                                ref={docInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt"
                                                onChange={handleDocumentChange}
                                                className="hidden"
                                            />
                                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload document</p>
                                        </div>
                                    </div>
                                    {documentName && (
                                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200">
                                            <File className="h-5 w-5 text-blue-500" />
                                            <span className="text-sm text-blue-700 truncate max-w-[150px]">{documentName}</span>
                                            <button
                                                type="button"
                                                onClick={removeDocument}
                                                className="text-blue-500 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Video Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video File
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => videoInputRef.current?.click()}
                                        >
                                            <input
                                                ref={videoInputRef}
                                                type="file"
                                                accept=".mp4,.avi,.mov,.wmv"
                                                onChange={handleVideoChange}
                                                className="hidden"
                                            />
                                            <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload video</p>
                                        </div>
                                    </div>
                                    {videoName && (
                                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-xl border border-purple-200">
                                            <Video className="h-5 w-5 text-purple-500" />
                                            <span className="text-sm text-purple-700 truncate max-w-[150px]">{videoName}</span>
                                            <button
                                                type="button"
                                                onClick={removeVideo}
                                                className="text-purple-500 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Files */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Files
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => additionalInputRef.current?.click()}
                                        >
                                            <input
                                                ref={additionalInputRef}
                                                type="file"
                                                multiple
                                                onChange={handleAdditionalFilesChange}
                                                className="hidden"
                                            />
                                            <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload additional files</p>
                                        </div>
                                    </div>
                                    {additionalFilesList.length > 0 && (
                                        <div className="flex flex-col gap-1 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 max-w-[200px]">
                                            {additionalFilesList.slice(0, 3).map((file, index) => (
                                                <span key={index} className="text-sm text-gray-700 truncate">
                                                    📄 {file}
                                                </span>
                                            ))}
                                            {additionalFilesList.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                    +{additionalFilesList.length - 3} more
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={removeAdditionalFiles}
                                                className="text-red-500 hover:text-red-700 text-xs mt-1"
                                            >
                                                Remove all
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} className="flex-1">
                                    {createMutation.isLoading || updateMutation.isLoading ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-1" />
                                            {editingMaterial ? 'Update' : 'Assign'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && viewingMaterial && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Material Details
                            </h2>
                            <button onClick={closeViewModal} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Material Info */}
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className={`p-3 rounded-xl ${getTypeColor(getMaterialType(viewingMaterial.materialId))} border`}>
                                    {getTypeIcon(getMaterialType(viewingMaterial.materialId))}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {getMaterialName(viewingMaterial.materialId)}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className={`text-xs px-2.5 py-1 rounded-full ${getTypeColor(getMaterialType(viewingMaterial.materialId))} capitalize border`}>
                                            {getMaterialType(viewingMaterial.materialId)}
                                        </span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full ${getCategoryColor(getMaterialCategory(viewingMaterial.materialId))} capitalize`}>
                                            {getMaterialCategory(viewingMaterial.materialId)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {getUserName(viewingMaterial.userId).charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{getUserName(viewingMaterial.userId)}</p>
                                    <p className="text-sm text-gray-500">Assigned User</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500">Quantity</p>
                                    <p className="text-lg font-semibold text-gray-900">{viewingMaterial.quantity || 1}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        viewingMaterial.status === 'active' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {viewingMaterial.status || 'active'}
                                    </span>
                                </div>
                            </div>

                            {/* Internal Notes */}
                            {viewingMaterial.notes && (
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm font-medium text-gray-700 mb-1">📝 Internal Notes</p>
                                    <p className="text-sm text-gray-700">{viewingMaterial.notes}</p>
                                </div>
                            )}

                            {/* Custom Notes (Visible to User) */}
                            {viewingMaterial.customNotes && (
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <p className="text-sm font-medium text-blue-800 mb-1">📌 Notes for User</p>
                                    <p className="text-sm text-blue-700">{viewingMaterial.customNotes}</p>
                                </div>
                            )}

                            {/* Files Section */}
                            <div className="space-y-3">
                                {/* Image */}
                                {(viewingMaterial.image || viewingMaterial.imageUrl) && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-medium text-gray-700 mb-2">🖼️ Image</p>
                                        <img 
                                            src={viewingMaterial.image || viewingMaterial.imageUrl} 
                                            alt="Material" 
                                            className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Document */}
                                {(viewingMaterial.document || viewingMaterial.documentUrl) && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-medium text-gray-700 mb-2">📄 Document</p>
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                            <FileText className="h-6 w-6 text-blue-500" />
                                            <span className="text-sm text-gray-700 flex-1 truncate">
                                                {viewingMaterial.document || viewingMaterial.documentUrl}
                                            </span>
                                            <a 
                                                href={viewingMaterial.document || viewingMaterial.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Video */}
                                {(viewingMaterial.video || viewingMaterial.videoUrl) && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-medium text-gray-700 mb-2">🎬 Video</p>
                                        <div className="bg-black rounded-lg overflow-hidden">
                                            <video 
                                                controls 
                                                className="w-full max-h-64"
                                                src={viewingMaterial.video || viewingMaterial.videoUrl}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Files */}
                                {((viewingMaterial.additionalFiles && viewingMaterial.additionalFiles.length > 0) ||
                                  (viewingMaterial.additionalFileUrls && viewingMaterial.additionalFileUrls.length > 0)) && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-medium text-gray-700 mb-2">📁 Additional Files</p>
                                        <div className="space-y-2">
                                            {(viewingMaterial.additionalFiles || viewingMaterial.additionalFileUrls || []).map((file, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                    <File className="h-5 w-5 text-gray-500" />
                                                    <span className="text-sm text-gray-700 flex-1 truncate">{file}</span>
                                                    <a 
                                                        href={file}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    onClick={() => {
                                        closeViewModal();
                                        openModal(viewingMaterial);
                                    }}
                                    className="flex-1"
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={closeViewModal}
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}