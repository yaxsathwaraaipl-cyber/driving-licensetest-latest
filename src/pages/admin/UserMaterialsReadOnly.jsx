// pages/user/UserMaterialsReadOnly.jsx
import { useState, useEffect } from 'react';
import { 
    Search, Book, User, Package, FileText, Video, 
    Image, File, Download, Eye, FolderOpen, 
    MessageSquare, ExternalLink, X, Play, 
    Loader2, Grid3x3, List,
    AlertCircle, CheckCircle, Clock, ArrowUpRight,
    GraduationCap, Layers, TrendingUp, Award,
    Zap, Brain, Target, BarChart3
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { learningService } from '../../services/learningService';

export default function UserMaterialsReadOnly() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedBank, setSelectedBank] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [learningData, setLearningData] = useState(null);
    const [error, setError] = useState(null);

    // Load learning data from API
    useEffect(() => {
        fetchLearningData();
    }, []);

    const fetchLearningData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const provinceId = '6a4f2ee20cfd70b690311c57';
            const response = await learningService.getLearningQuestions(provinceId);
            
            if (response.success && response.data) {
                setLearningData(response.data);
            } else {
                setError('Failed to load learning materials');
            }
        } catch (err) {
            console.error('Error fetching learning data:', err);
            setError(err.message || 'An error occurred while loading materials');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper functions
    const getCategoryColor = (category = 'general') => {
        const colors = {
            'road sign test': 'bg-amber-50 text-amber-700 border-amber-200',
            'traffic rules': 'bg-blue-50 text-blue-700 border-blue-200',
            'practice': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'general': 'bg-gray-50 text-gray-700 border-gray-200'
        };
        return colors[category?.toLowerCase()] || colors.general;
    };

    const getCategoryIcon = (category = 'general') => {
        const icons = {
            'road sign test': <Layers className="h-3.5 w-3.5" />,
            'traffic rules': <Book className="h-3.5 w-3.5" />,
            'practice': <GraduationCap className="h-3.5 w-3.5" />
        };
        return icons[category?.toLowerCase()] || <Package className="h-3.5 w-3.5" />;
    };

    const getCategoryGradient = (category = 'general') => {
        const gradients = {
            'road sign test': 'from-amber-50 to-amber-100/50',
            'traffic rules': 'from-blue-50 to-blue-100/50',
            'practice': 'from-emerald-50 to-emerald-100/50',
            'general': 'from-gray-50 to-gray-100/50'
        };
        return gradients[category?.toLowerCase()] || gradients.general;
    };

    // Get unique categories for filters
    const getCategories = () => {
        if (!learningData?.questionBanks) return [];
        const categories = new Set();
        learningData.questionBanks.forEach(bank => {
            if (bank.category?.title) {
                categories.add(bank.category.title);
            }
        });
        return Array.from(categories);
    };

    // Handle View Bank Details - Full view
    const handleViewBank = (bank) => {
        setSelectedBank(bank);
        setIsPreviewOpen(true);
    };

    // Handle Download Questions
    const handleDownloadQuestions = (bank) => {
        if (!bank.questions || bank.questions.length === 0) {
            alert('No questions available to download');
            return;
        }

        try {
            let content = `📚 Question Bank: ${bank.bankTitle}\n`;
            content += `📂 Category: ${bank.category?.title || 'N/A'}\n`;
            content += `📝 Total Questions: ${bank.totalQuestions}\n`;
            content += `${'═'.repeat(60)}\n\n`;

            bank.questions.forEach((q, index) => {
                content += `❓ Question ${index + 1}: ${q.questionText}\n`;
                content += `📋 Options:\n`;
                q.options.forEach((opt, optIndex) => {
                    const prefix = opt.isCorrect ? '✅' : '  ';
                    content += `  ${prefix} ${String.fromCharCode(65 + optIndex)}. ${opt.text}\n`;
                });
                if (q.explanation) {
                    content += `💡 Explanation: ${q.explanation}\n`;
                }
                content += `⭐ Marks: ${q.marks}\n`;
                content += `${'─'.repeat(40)}\n\n`;
            });

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${bank.bankTitle.replace(/\s+/g, '_')}_questions.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download questions. Please try again.');
        }
    };

    // Filter banks with improved search
    const filteredBanks = learningData?.questionBanks?.filter(bank => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return true;

        const bankTitle = bank.bankTitle?.toLowerCase() || '';
        const bankDescription = bank.bankDescription?.toLowerCase() || '';
        const categoryTitle = bank.category?.title?.toLowerCase() || '';
        const categoryDescription = bank.category?.description?.toLowerCase() || '';

        const questionMatches = bank.questions?.some(q => 
            q.questionText?.toLowerCase().includes(search) ||
            q.options?.some(opt => opt.text?.toLowerCase().includes(search)) ||
            q.explanation?.toLowerCase().includes(search)
        );

        const matchesSearch = bankTitle.includes(search) || 
                            bankDescription.includes(search) || 
                            categoryTitle.includes(search) ||
                            categoryDescription.includes(search) ||
                            questionMatches;

        const matchesCategory = filterCategory === 'all' || 
                               bank.category?.title === filterCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Render Bank Card - Improved design
    const renderBankCard = (bank) => {
        const id = bank.bankId;
        const hasQuestions = bank.questions && bank.questions.length > 0;
        const correctCount = bank.questions?.filter(q => 
            q.options?.some(opt => opt.isCorrect)
        ).length || 0;
        const category = bank.category?.title || 'general';
        const gradientClass = getCategoryGradient(category);

        return (
            <Card 
                key={id} 
                className={`group relative overflow-hidden bg-gradient-to-br ${gradientClass} border-2 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer p-0`}
            >
                {/* Decorative top bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${
                    category === 'road sign test' ? 'from-amber-400 to-amber-600' :
                    category === 'traffic rules' ? 'from-blue-400 to-blue-600' :
                    category === 'practice' ? 'from-emerald-400 to-emerald-600' :
                    'from-gray-400 to-gray-600'
                }`} />

                <div className="p-5">
                    {/* Header with icon and title */}
                    <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm flex-shrink-0`}>
                            {getCategoryIcon(category)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1">
                                {bank.bankTitle || 'Untitled Bank'}
                            </h3>
                            {bank.category?.title && (
                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${getCategoryColor(category)} font-medium mt-1`}>
                                    {getCategoryIcon(category)}
                                    {bank.category.title}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats in a clean row */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
                            <Package className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-xs font-medium text-gray-700">{bank.totalQuestions || 0}</span>
                            <span className="text-xs text-gray-500">Questions</span>
                        </div>
                        {hasQuestions && (
                            <>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                    <span className="text-xs font-medium text-gray-700">{correctCount}</span>
                                    <span className="text-xs text-gray-500">Correct</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
                                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                                    <span className="text-xs font-medium text-gray-700">
                                        {Math.round((correctCount / bank.totalQuestions) * 100)}%
                                    </span>
                                    <span className="text-xs text-gray-500">Rate</span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
                            <Clock className="h-3.5 w-3.5 text-purple-600" />
                            <span className="text-xs font-medium text-gray-700">{bank.totalQuestions || 0}</span>
                            <span className="text-xs text-gray-500">Total</span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200/50">
                        <div className="flex items-center gap-1.5">
                            {hasQuestions && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                    <CheckCircle className="h-3 w-3" />
                                    Available
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {hasQuestions && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex items-center gap-1.5 text-xs bg-white/80 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300 transition-all border-gray-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadQuestions(bank);
                                    }}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </Button>
                            )}
                            <Button 
                                size="sm" 
                                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewBank(bank);
                                }}
                            >
                                <Eye className="h-3.5 w-3.5" />
                                View
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    // Question Item Component - Reusable
    const QuestionItem = ({ question, index }) => {
        const correctOptions = question.options?.filter(opt => opt.isCorrect) || [];
        
        return (
            <div className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all hover:border-blue-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {index + 1}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                            {question.questionText}
                        </p>
                        
                        {question.questionImage && (
                            <img 
                                src={question.questionImage} 
                                alt={`Question ${index + 1}`}
                                className="mt-2 mb-3 max-w-full max-h-48 object-contain rounded-lg border border-gray-200"
                            />
                        )}
                        
                        <div className="space-y-2">
                            {question.options.map((opt, optIndex) => (
                                <div 
                                    key={optIndex} 
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                        opt.isCorrect 
                                            ? 'bg-emerald-50 border-2 border-emerald-300 shadow-sm' 
                                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className={`text-sm font-semibold w-7 ${
                                        opt.isCorrect ? 'text-emerald-700' : 'text-gray-500'
                                    }`}>
                                        {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    <span className={`text-sm flex-1 ${
                                        opt.isCorrect ? 'text-emerald-700 font-medium' : 'text-gray-700'
                                    }`}>
                                        {opt.text}
                                    </span>
                                    {opt.isCorrect && (
                                        <span className="flex items-center gap-1 text-xs bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">
                                            <CheckCircle className="h-3 w-3" />
                                            Correct
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {question.explanation && (
                            <div className="mt-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Book className="h-4 w-4 text-amber-600" />
                                    <p className="text-sm font-semibold text-amber-800">Explanation</p>
                                </div>
                                <p className="text-sm text-amber-700">{question.explanation}</p>
                                {question.explanationImage && (
                                    <img 
                                        src={question.explanationImage} 
                                        alt="Explanation"
                                        className="mt-2 max-w-full max-h-32 object-contain rounded-lg"
                                    />
                                )}
                            </div>
                        )}
                        
                        <div className="mt-3 flex items-center gap-3">
                            <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                ⭐ Marks: {question.marks}
                            </span>
                            {correctOptions.length > 0 && (
                                <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full font-medium">
                                    {correctOptions.length} correct option{correctOptions.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Preview Modal - Full view with all details
    const renderPreviewModal = () => {
        if (!selectedBank) return null;

        const bank = selectedBank;
        const category = bank.category?.title || 'general';
        const correctCount = bank.questions?.filter(q => 
            q.options?.some(opt => opt.isCorrect)
        ).length || 0;

        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden">
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${getCategoryGradient(category)} p-6 border-b border-gray-200`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-xl font-bold text-gray-900">{bank.bankTitle}</h3>
                                    {bank.category?.title && (
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${getCategoryColor(category)} font-medium`}>
                                            {getCategoryIcon(category)}
                                            {bank.category.title}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1.5">
                                        <Package className="h-4 w-4" />
                                        {bank.totalQuestions || 0} Questions
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        {correctCount} Correct Answers
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        {bank.totalQuestions > 0 ? Math.round((correctCount / bank.totalQuestions) * 100) : 0}% Rate
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm"
                                    onClick={() => handleDownloadQuestions(bank)}
                                >
                                    <Download className="h-4 w-4" />
                                    Download All
                                </Button>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="p-2 bg-white/80 backdrop-blur-sm hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
                        
                        {/* Category Info */}
                        {bank.category && (
                            <div className={`p-4 bg-gradient-to-r ${getCategoryGradient(category)} rounded-xl border border-blue-200`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Layers className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm font-semibold text-blue-800">Category Information</p>
                                </div>
                                <p className="text-sm font-medium text-blue-700">{bank.category.title}</p>
                                {bank.category.description && (
                                    <p className="text-sm text-blue-600 mt-1">{bank.category.description}</p>
                                )}
                            </div>
                        )}

                        {/* All Questions */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="h-5 w-5 text-blue-600" />
                                <p className="text-sm font-semibold text-gray-700">
                                    All Questions ({bank.questions?.length || 0})
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                {bank.questions && bank.questions.map((q, index) => (
                                    <QuestionItem key={index} question={q} index={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 font-medium">Loading learning materials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-500 font-medium text-center max-w-md">{error}</p>
                <Button onClick={fetchLearningData} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Loader2 className="h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="h-7 w-7 text-blue-600" />
                        Learning Materials
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                        <span>{learningData?.totalBanks || 0} question banks available</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{learningData?.totalQuestions || 0} total questions</span>
                    </p>
                </div>
                {learningData && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                        <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-700">{learningData.totalBanks || 0}</span>
                            <span className="text-xs text-gray-500">Banks</span>
                        </div>
                        <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm flex items-center gap-1.5">
                            <Book className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-gray-700">{learningData.totalQuestions || 0}</span>
                            <span className="text-xs text-gray-500">Questions</span>
                        </div>
                        <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-semibold text-gray-700">{learningData.totalCategories || 0}</span>
                            <span className="text-xs text-gray-500">Categories</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search banks, categories, or questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all hover:border-gray-300"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all hover:border-gray-300 min-w-[160px]"
                    >
                        <option value="all">All Categories</option>
                        {getCategories().map((category) => (
                            <option key={category} value={category} className="capitalize">
                                {category}
                            </option>
                        ))}
                    </select>
                    <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 transition-all ${
                                viewMode === 'grid' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 transition-all ${
                                viewMode === 'list' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results count */}
            {filteredBanks && filteredBanks.length > 0 && (
                <p className="text-sm text-gray-500">
                    Showing {filteredBanks.length} of {learningData?.questionBanks?.length || 0} banks
                </p>
            )}

            {/* Banks Display */}
            {!filteredBanks || filteredBanks.length === 0 ? (
                <Card className="p-16 text-center">
                    <div className="max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Book className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No question banks found</h3>
                        <p className="text-gray-500 mt-2">
                            {searchTerm || filterCategory !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'No question banks are currently available.'}
                        </p>
                    </div>
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {filteredBanks.map(renderBankCard)}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredBanks.map(renderBankCard)}
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && renderPreviewModal()}
        </div>
    );
}