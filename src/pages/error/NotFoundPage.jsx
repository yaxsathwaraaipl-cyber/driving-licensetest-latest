import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                {/* 404 Illustration */}
                <div className="relative mb-8">
                    <div className="text-[150px] font-bold text-blue-100 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="h-24 w-24 text-blue-300" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h1>
                <p className="text-gray-500 mb-8 text-lg">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to={ROUTES.HOME}>
                        <Button icon={Home} size="lg">
                            Back to Home
                        </Button>
                    </Link>
                    <Link to={ROUTES.DASHBOARD}>
                        <Button variant="secondary" icon={ArrowLeft} size="lg">
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-blue-100">
                    <p className="text-sm text-gray-600 mb-3">Quick Links</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link to={ROUTES.LOGIN} className="text-sm text-primary-600 hover:text-primary-700">
                            Login
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to={ROUTES.PRACTICE} className="text-sm text-primary-600 hover:text-primary-700">
                            Practice Tests
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to={ROUTES.DASHBOARD} className="text-sm text-primary-600 hover:text-primary-700">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};