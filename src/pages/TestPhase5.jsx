import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CardSkeleton, TableSkeleton, FormSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export default function TestPhase5() {
    const [showSkeleton, setShowSkeleton] = useState(false);
    const toast = useToast();

    return (
        <div className="space-y-6 p-8">
            <h1 className="text-2xl font-bold">Phase 5 Testing Page</h1>

            {/* Toast Testing */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">1. Toast Notifications</h2>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => toast.success('Operation completed!', 'Success')}>
                        Success Toast
                    </Button>
                    <Button onClick={() => toast.error('Something went wrong!', 'Error')}>
                        Error Toast
                    </Button>
                    <Button onClick={() => toast.warning('Proceed with caution', 'Warning')}>
                        Warning Toast
                    </Button>
                    <Button onClick={() => toast.info('New feature available', 'Info')}>
                        Info Toast
                    </Button>
                </div>
            </Card>

            {/* Skeleton Testing */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">2. Skeleton Loaders</h2>
                <Button onClick={() => setShowSkeleton(!showSkeleton)} className="mb-4">
                    {showSkeleton ? 'Hide' : 'Show'} Skeletons
                </Button>
                {showSkeleton && (
                    <div className="space-y-4">
                        <h3 className="font-medium">Card Skeleton</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <CardSkeleton />
                            <CardSkeleton />
                        </div>
                        <h3 className="font-medium mt-4">Table Skeleton</h3>
                        <TableSkeleton />
                        <h3 className="font-medium mt-4">Form Skeleton</h3>
                        <FormSkeleton />
                    </div>
                )}
            </Card>

            {/* Empty State Testing */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">3. Empty States</h2>
                <EmptyState
                    icon="file"
                    title="No tests found"
                    description="You haven't taken any tests yet."
                    actionLabel="Start Practice"
                    onAction={() => alert('Navigate to practice')}
                />
            </Card>

            {/* Error Pages Testing */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">4. Error Pages</h2>
                <div className="flex flex-wrap gap-2">
                    <Link to="/nonexistent">
                        <Button variant="secondary">404 Page</Button>
                    </Link>
                    <Link to="/403">
                        <Button variant="secondary">403 Page</Button>
                    </Link>
                    <Link to="/500">
                        <Button variant="secondary">500 Page</Button>
                    </Link>
                </div>
            </Card>

            {/* Results Page */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">5. Results Page</h2>
                <Link to="/results">
                    <Button>Go to Results</Button>
                </Link>
            </Card>
        </div>
    );
};