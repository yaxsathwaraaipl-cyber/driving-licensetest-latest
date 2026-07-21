export const Skeleton = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
};

export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
        </div>
    );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex gap-4">
                    {Array.from({ length: cols }).map((_, i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
            </div>
            {/* Rows */}
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="px-6 py-4">
                        <div className="flex gap-4">
                            {Array.from({ length: cols }).map((_, j) => (
                                <Skeleton key={j} className="h-4 flex-1" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ProfileSkeleton = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-3 flex-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};

export const FormSkeleton = ({ fields = 4 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <Skeleton className="h-10 w-32" />
        </div>
    );
};

export const PracticeCardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </div>
    );
};