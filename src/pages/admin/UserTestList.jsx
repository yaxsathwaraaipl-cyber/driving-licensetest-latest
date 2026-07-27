// pages/user/UserTestList.jsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
    Search, AlertCircle, FileText, MapPin, 
    ChevronLeft, ChevronRight, Clock, 
    X, Loader2, ChevronDown, ChevronUp,
    BookOpen, CheckCircle, Award, Timer,
    PlayCircle, Calendar, Layers
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { testService } from '../../services/testService';
import { ROUTES } from '../../constants';

// ====== Custom Hooks ======
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// ====== Helper Functions ======
const getProvinceId = (user) => {
    if (!user) return null;
    
    if (user.provinceId && typeof user.provinceId === 'object') {
        return user.provinceId.id || user.provinceId._id || null;
    }
    if (typeof user.provinceId === 'string') {
        return user.provinceId;
    }
    if (user.province && typeof user.province === 'object') {
        return user.province.id || user.province._id || null;
    }
    if (typeof user.province === 'string') {
        return user.province;
    }
    return null;
};

const getProvinceName = (user) => {
    if (!user) return null;
    
    if (user.provinceId && typeof user.provinceId === 'object') {
        return user.provinceId.name || null;
    }
    if (user.province && typeof user.province === 'object') {
        return user.province.name || null;
    }
    return null;
};

// ====== Main Component ======
export default function UserTestList() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuthStore();
    
    // ====== State ======
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);
    const [firstLoadDone, setFirstLoadDone] = useState(false);
    
    const itemsPerPage = 8;
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    // ====== User Data ======
    const userProvinceId = getProvinceId(user);
    const userProvinceName = getProvinceName(user);

    // ====== Reset page on search ======
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    // ====== Toggle description ======
    const toggleDescription = (testId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [testId]: !prev[testId]
        }));
    };

    // ====== Fetch Tests ======
    const { 
        data: responseData, 
        isLoading, 
        refetch, 
        isFetching, 
        error: queryError,
        isSuccess,
        isError
    } = useQuery({
        queryKey: ['user-tests', userProvinceId, refreshKey],
        queryFn: async () => {
            try {
                if (!userProvinceId) {
                    console.log('⚠️ No user province ID found');
                    return { data: [], count: 0, province: null };
                }

                console.log('📡 Fetching tests for province:', userProvinceId);
                
                const response = await testService.getByProvince(userProvinceId);
                console.log('📦 API Response:', response);
                
                const testData = response?.data || [];
                const provinceInfo = response?.province || null;
                const totalRecords = response?.count || testData.length;

                return {
                    data: testData,
                    count: totalRecords,
                    province: provinceInfo || (userProvinceName ? { name: userProvinceName, _id: userProvinceId } : null)
                };
            } catch (err) {
                console.error('❌ Error fetching tests:', err);
                setError(err.message || 'Failed to load tests');
                return { data: [], count: 0, province: null };
            }
        },
        enabled: !authLoading && !!userProvinceId,
        retry: 2,
        retryDelay: 1000,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    // ====== Side Effects ======
    useEffect(() => {
        if (!authLoading && userProvinceId && !firstLoadDone) {
            setFirstLoadDone(true);
            refetch();
        }
    }, [authLoading, userProvinceId, refetch, firstLoadDone]);

    useEffect(() => {
        if (refreshKey > 0 && userProvinceId) {
            refetch();
        }
    }, [refreshKey, userProvinceId, refetch]);

    useEffect(() => {
        if (isSuccess && responseData) {
            console.log('✅ Tests loaded:', {
                total: responseData.data?.length || 0,
                province: responseData.province?.name
            });
        }
    }, [isSuccess, responseData]);

    // ====== Data Processing ======
    const allTests = responseData?.data || [];
    const province = responseData?.province || (userProvinceName ? { name: userProvinceName } : null);
    
    const filteredTests = (() => {
        if (!debouncedSearchTerm) return allTests;
        
        const searchLower = debouncedSearchTerm.toLowerCase().trim();
        return allTests.filter(test => {
            const title = test.title?.toLowerCase() || '';
            const description = test.description?.toLowerCase() || '';
            const provinceName = test.provinceId?.name?.toLowerCase() || '';
            const countryName = test.countryId?.name?.toLowerCase() || '';
            
            return title.includes(searchLower) || 
                   description.includes(searchLower) || 
                   provinceName.includes(searchLower) ||
                   countryName.includes(searchLower);
        });
    })();

    const totalRecords = filteredTests.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
    const paginatedTests = filteredTests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ====== Event Handlers ======
    const handleStartTest = (testId) => {
        navigate(`/tests/${testId}`);
    };

    const handleRetry = () => {
        setRefreshKey(prev => prev + 1);
        setFirstLoadDone(false);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    // ====== Render Helpers ======
    const renderLoading = (message = 'Loading tests...') => (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="text-gray-500">{message}</p>
        </div>
    );

    const renderError = (errorMessage) => (
        <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Error loading tests</h3>
                <p className="text-gray-500 mt-2">{errorMessage || 'Please try again later.'}</p>
                <Button onClick={handleRetry} className="mt-4">
                    Retry
                </Button>
            </div>
        </Card>
    );

    const renderNoProvince = () => (
        <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
                <MapPin className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Province Assigned</h3>
                <p className="text-gray-500 mt-2">
                    Your account doesn't have a province assigned. Please contact your administrator.
                </p>
            </div>
        </Card>
    );

    const renderEmptyState = () => (
        <div className="space-y-6">
            {renderHeader()}
            {renderSearchBar()}
            <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No tests found</h3>
                    <p className="text-gray-500 mt-2">
                        No tests are available for {province?.name || userProvinceName || 'your province'} at the moment.
                    </p>
                    <Button 
                        variant="outline" 
                        onClick={handleRetry} 
                        className="mt-4"
                        disabled={isFetching}
                    >
                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                    </Button>
                </div>
            </Card>
        </div>
    );

    const renderHeader = () => (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
                {(province || userProvinceName) && (
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Showing tests for: <span className="font-medium">{province?.name || userProvinceName}</span>
                        <Badge variant="info" className="ml-2">
                            {totalRecords} tests
                        </Badge>
                    </p>
                )}
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry} 
                className="flex items-center gap-2"
                disabled={isFetching}
            >
                {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                )}
                Refresh
            </Button>
        </div>
    );

    const renderSearchBar = () => (
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
                type="text"
                placeholder="Search tests by title, description, or province..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            />
            {isFetching && searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                </div>
            )}
            {searchTerm && !isFetching && (
                <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );

    const renderSearchResultsInfo = () => (
        debouncedSearchTerm && (
            <p className="text-sm text-gray-500">
                Found {totalRecords} result{totalRecords !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
            </p>
        )
    );

    const renderNoResults = () => (
        debouncedSearchTerm && filteredTests.length === 0 && (
            <Card className="p-8 text-center">
                <div className="max-w-md mx-auto">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                    <p className="text-gray-500 mt-2">
                        No tests match your search for "{debouncedSearchTerm}"
                    </p>
                    <Button variant="outline" onClick={handleClearSearch} className="mt-4">
                        Clear Search
                    </Button>
                </div>
            </Card>
        )
    );

    const renderPagination = () => (
        totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} tests
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "primary" : "outline"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    );

    const renderTestCard = (test) => {
        const countryName = test.countryId?.name || 'N/A';
        const provinceName = test.provinceId?.name || 'N/A';
        const isExpanded = expandedDescriptions[test._id] || false;
        const description = test.description || 'No description available';
        const wordCount = description.split(/\s+/).length;
        const shouldTruncate = wordCount > 8;
        const timer = test.categories?.[0]?.timer || 0;
        const passRate = test.passingScore && test.totalMarks 
            ? Math.round((test.passingScore / test.totalMarks) * 100)
            : 0;

        return (
            <Card key={test._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                {/* Header */}
                <div className="p-3 pb-1 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {test.title}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {test.isPublished ? 'Published' : 'Draft'}
                        </p>
                    </div>
                    <Badge 
                        variant={test.isActive ? 'success' : 'danger'} 
                        className="text-[10px] px-1.5 py-0.5 flex-shrink-0 ml-2"
                    >
                        {test.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                {/* Description */}
                <div className="px-3 py-1">
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                        {shouldTruncate && !isExpanded 
                            ? description.split(/\s+/).slice(0, 8).join(' ') + '...'
                            : description
                        }
                    </p>
                    {shouldTruncate && (
                        <button
                            onClick={() => toggleDescription(test._id)}
                            className="text-blue-600 hover:text-blue-800 text-[10px] font-medium mt-0.5 flex items-center gap-0.5"
                        >
                            {isExpanded ? (
                                <>Show Less <ChevronUp className="h-2.5 w-2.5" /></>
                            ) : (
                                <>Show More <ChevronDown className="h-2.5 w-2.5" /></>
                            )}
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="px-3 py-1.5 grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                        <FileText className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Q: {test.totalQuestions || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                        <Award className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Marks: {test.totalMarks || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                        <CheckCircle className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                        <span className="truncate">Pass: {test.passingScore || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                        <Timer className="h-2.5 w-2.5 text-orange-500 flex-shrink-0" />
                        <span className="truncate">{timer} min</span>
                    </div>
                </div>

                {/* Location */}
                <div className="px-3 py-0.5 space-y-0.5 text-[10px]">
                    <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Province: <span className="font-medium">{provinceName}</span></span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                        <Layers className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Country: <span className="font-medium">{countryName}</span></span>
                    </div>
                </div>

                {/* Pass Rate */}
                <div className="px-3 py-1">
                    <div className="flex items-center justify-between text-[9px] text-gray-400 mb-0.5">
                        <span>Pass Rate</span>
                        <span className="font-medium text-gray-600">{passRate}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${passRate >= 70 ? 'bg-green-500' : passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${passRate}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-2.5 pt-1 mt-auto border-t border-gray-100">
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="text-[11px] px-3 py-1 h-7 w-full flex items-center justify-center gap-1"
                        onClick={() => handleStartTest(test._id)}
                        disabled={!test.isActive}
                    >
                        <PlayCircle className="h-3.5 w-3.5" />
                        {test.isActive ? 'Start Test' : 'Coming Soon'}
                    </Button>
                </div>
            </Card>
        );
    };

    // ====== Main Render ======
    // Auth Loading
    if (authLoading) return renderLoading('Loading user information...');
    
    // Data Loading
    if (isLoading || (isFetching && !responseData)) return renderLoading();
    
    // Error
    if (isError || error) return renderError(queryError?.message || error);
    
    // No Province
    if (!userProvinceId && !authLoading) return renderNoProvince();
    
    // Empty State
    if (allTests.length === 0) return renderEmptyState();

    // Main Content
    return (
        <div className="space-y-6">
            {renderHeader()}
            {renderSearchBar()}
            {renderSearchResultsInfo()}
            {renderNoResults()}

            {filteredTests.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {paginatedTests.map(renderTestCard)}
                    </div>
                    {renderPagination()}
                </>
            )}
        </div>
    );
}