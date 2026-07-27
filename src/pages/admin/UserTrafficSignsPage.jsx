// UserTrafficSignsPage.jsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { 
    Search, AlertCircle, FileText, MapPin, 
    ChevronLeft, ChevronRight, Image as ImageIcon,
    X, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { trafficSignService } from '../../services/trafficSignService';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function UserTrafficSignsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);
    const [firstLoadDone, setFirstLoadDone] = useState(false);
    const itemsPerPage = 8;

    const { user, isLoading: authLoading } = useAuthStore();
    
    // ✅ Get user's province ID - handle both string and object
    const userProvinceId = (() => {
        if (!user) return null;
        
        // If provinceId is an object with id
        if (user.provinceId && typeof user.provinceId === 'object') {
            return user.provinceId.id || user.provinceId._id || null;
        }
        
        // If provinceId is a string
        if (typeof user.provinceId === 'string') {
            return user.provinceId;
        }
        
        // If province is an object with id
        if (user.province && typeof user.province === 'object') {
            return user.province.id || user.province._id || null;
        }
        
        // If province is a string
        if (typeof user.province === 'string') {
            return user.province;
        }
        
        return null;
    })();

    // ✅ Get province name
    const userProvinceName = (() => {
        if (!user) return null;
        
        if (user.provinceId && typeof user.provinceId === 'object') {
            return user.provinceId.name || null;
        }
        
        if (user.province && typeof user.province === 'object') {
            return user.province.name || null;
        }
        
        return null;
    })();

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // ✅ Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    // ✅ Toggle description expansion
    const toggleDescription = (signId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [signId]: !prev[signId]
        }));
    };

    // ✅ Fetch traffic signs based on user's province
    const { 
        data: responseData, 
        isLoading, 
        refetch, 
        isFetching, 
        error: queryError,
        isSuccess,
        isError
    } = useQuery({
        queryKey: ['user-traffic-signs', userProvinceId, refreshKey],
        queryFn: async () => {
            try {
                if (!userProvinceId) {
                    console.log('⚠️ No user province ID found');
                    return { 
                        data: [], 
                        totalRecords: 0, 
                        province: null, 
                        totalPages: 0 
                    };
                }

                console.log('📡 API Call: Fetching traffic signs for province ID:', userProvinceId);
                console.log('📍 Province name:', userProvinceName);
                
                // ✅ Call the API - getByProvince returns the full response structure
                const response = await trafficSignService.getByProvince(userProvinceId);
                
                console.log('📦 API Response:', response);
                
                // ✅ Extract data from response
                let signData = response?.data || [];
                let provinceInfo = response?.province || null;
                let totalRecords = response?.totalRecords || signData.length;

                // If API didn't return province info, use the one from user
                if (!provinceInfo && userProvinceName) {
                    provinceInfo = { name: userProvinceName, _id: userProvinceId };
                }

                return {
                    data: signData,
                    province: provinceInfo,
                    totalRecords: totalRecords,
                    totalPages: Math.max(1, Math.ceil(signData.length / itemsPerPage))
                };
            } catch (err) {
                console.error('❌ Error fetching user traffic signs:', err);
                setError(err.message || 'Failed to load traffic signs');
                return { 
                    data: [], 
                    province: null, 
                    totalRecords: 0, 
                    totalPages: 0 
                };
            }
        },
        // ✅ Only enable when auth is not loading and we have a province ID
        enabled: !authLoading && !!userProvinceId,
        retry: 2,
        retryDelay: 1000,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    // ✅ Refetch when auth loading completes and province ID is available
    useEffect(() => {
        if (!authLoading && userProvinceId && !firstLoadDone) {
            console.log('🔄 Auth complete, loading signs');
            setFirstLoadDone(true);
            refetch();
        }
    }, [authLoading, userProvinceId, refetch, firstLoadDone]);

    // ✅ Force refetch when refreshKey changes
    useEffect(() => {
        if (refreshKey > 0 && userProvinceId) {
            refetch();
        }
    }, [refreshKey, userProvinceId, refetch]);

    // ✅ Log when data is successfully loaded
    useEffect(() => {
        if (isSuccess && responseData) {
            console.log('✅ Traffic signs loaded successfully:', {
                total: responseData.data?.length || 0,
                province: responseData.province?.name,
                refreshKey: refreshKey
            });
        }
    }, [isSuccess, responseData, refreshKey]);

    // ✅ Extract data from response
    const allSigns = responseData?.data || [];
    const province = responseData?.province || (userProvinceName ? { name: userProvinceName } : null);
    
    // ✅ Apply search filter on the client side
    const filteredSigns = (() => {
        if (!debouncedSearchTerm) return allSigns;
        
        const searchLower = debouncedSearchTerm.toLowerCase().trim();
        return allSigns.filter(sign => {
            const title = sign.title?.toLowerCase() || '';
            const description = sign.description?.toLowerCase() || '';
            const category = sign.categoryId?.name?.toLowerCase() || '';
            
            return title.includes(searchLower) || 
                   description.includes(searchLower) || 
                   category.includes(searchLower);
        });
    })();

    const totalRecords = filteredSigns.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));

    // ✅ Paginate filtered signs
    const paginatedSigns = filteredSigns.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ✅ Auth loading state
    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="text-gray-500">Loading user information...</p>
            </div>
        );
    }

    // ✅ Loading state
    if (isLoading || (isFetching && !responseData)) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="text-gray-500">Loading traffic signs...</p>
            </div>
        );
    }

    // ✅ Error state
    if (isError || error) {
        return (
            <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Error loading traffic signs</h3>
                    <p className="text-gray-500 mt-2">{queryError?.message || error || 'Please try again later.'}</p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                        <Button 
                            onClick={() => {
                                setRefreshKey(prev => prev + 1);
                                setFirstLoadDone(false);
                            }} 
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    // ✅ No province assigned to user
    if (!userProvinceId && !authLoading) {
        return (
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
    }

    // ✅ No signs found
    if (allSigns.length === 0) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Traffic Signs</h1>
                        {(province || userProvinceName) && (
                            <p className="text-gray-500 mt-1 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Showing signs for: <span className="font-medium">{province?.name || userProvinceName}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search traffic signs by title, description, or category..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No traffic signs found</h3>
                        <p className="text-gray-500 mt-2">
                            No traffic signs are available for {province?.name || userProvinceName || 'your province'} at the moment.
                        </p>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setRefreshKey(prev => prev + 1);
                                setFirstLoadDone(false);
                            }} 
                            className="mt-4"
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Refresh'
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Traffic Signs</h1>
                    {(province || userProvinceName) && (
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Showing signs for: <span className="font-medium">{province?.name || userProvinceName}</span>
                            <Badge variant="info" className="ml-2">
                                {totalRecords} signs
                            </Badge>
                        </p>
                    )}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                        console.log('🔄 Manual refresh triggered');
                        setRefreshKey(prev => prev + 1);
                        setFirstLoadDone(false);
                    }} 
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

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search traffic signs by title, description, or category..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                />
                {isFetching && searchTerm !== debouncedSearchTerm && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    </div>
                )}
                {searchTerm && !isFetching && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Search Results Info */}
            {debouncedSearchTerm && (
                <p className="text-sm text-gray-500">
                    Found {totalRecords} result{totalRecords !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
                </p>
            )}

            {/* No results for search */}
            {filteredSigns.length === 0 && debouncedSearchTerm && (
                <Card className="p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                        <p className="text-gray-500 mt-2">
                            No traffic signs match your search for "{debouncedSearchTerm}"
                        </p>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                            }} 
                            className="mt-4"
                        >
                            Clear Search
                        </Button>
                    </div>
                </Card>
            )}

            {/* Signs Grid */}
            {filteredSigns.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {paginatedSigns.map((sign) => {
                            const categoryName = sign.categoryId?.name || 'Uncategorized';
                            const provinceNames = sign.provinceIds?.map(p => p.name).join(', ') || 'N/A';
                            const imageUrl = sign.image || null;
                            const isExpanded = expandedDescriptions[sign._id] || false;
                            const description = sign.description || 'No description available';
                            const wordCount = description.split(/\s+/).length;
                            const shouldTruncate = wordCount > 8;

                            return (
                                <Card key={sign._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                                    {/* Image */}
                                    <div className="relative h-28 bg-gray-100 flex-shrink-0">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={sign.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.parentElement.querySelector('.fallback-icon');
                                                    if (fallback) fallback.classList.remove('hidden');
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <ImageIcon className="h-8 w-8 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center bg-gray-50">
                                            <ImageIcon className="h-8 w-8 text-gray-300" />
                                        </div>
                                        <Badge 
                                            variant={sign.isActive ? 'success' : 'danger'} 
                                            className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5"
                                        >
                                            {sign.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    {/* Content */}
                                    <div className="p-2.5 flex flex-col flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5 line-clamp-1">
                                            {sign.title}
                                        </h3>
                                        
                                        <div className="mb-1.5">
                                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                                {shouldTruncate && !isExpanded 
                                                    ? description.split(/\s+/).slice(0, 8).join(' ') + '...'
                                                    : description
                                                }
                                            </p>
                                            {shouldTruncate && (
                                                <button
                                                    onClick={() => toggleDescription(sign._id)}
                                                    className="text-blue-600 hover:text-blue-800 text-[10px] font-medium mt-0.5 flex items-center gap-0.5"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            Show Less
                                                            <ChevronUp className="h-2.5 w-2.5" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            Show More
                                                            <ChevronDown className="h-2.5 w-2.5" />
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-0.5 text-[10px] flex-1">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <FileText className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">Category: <span className="font-medium">{categoryName}</span></span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <MapPin className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">Province: <span className="font-medium">{provinceNames}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} signs
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
                    )}
                </>
            )}
        </div>
    );
}