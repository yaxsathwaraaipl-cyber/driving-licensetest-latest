import { Link } from 'react-router-dom';
import { Home, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ServerErrorPage() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                <div className="relative mb-8">
                    <div className="text-[150px] font-bold text-red-100 leading-none select-none">
                        500
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="h-24 w-24 text-red-300 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Server Error
                </h1>
                <p className="text-gray-500 mb-8 text-lg">
                    Something went wrong on our end. Please try again later.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleRefresh} icon={RefreshCw} size="lg">
                        Try Again
                    </Button>
                    <Link to="/">
                        <Button variant="secondary" icon={Home} size="lg">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};