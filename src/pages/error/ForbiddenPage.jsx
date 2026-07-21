import { Link } from 'react-router-dom';
import { Home, ShieldOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants';

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                <div className="relative mb-8">
                    <div className="text-[150px] font-bold text-orange-100 leading-none select-none">
                        403
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldOff className="h-24 w-24 text-orange-300" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Access Denied
                </h1>
                <p className="text-gray-500 mb-8 text-lg">
                    You don't have permission to access this page.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to={ROUTES.DASHBOARD}>
                        <Button icon={Home} size="lg">
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Link to={ROUTES.LOGIN}>
                        <Button variant="secondary" size="lg">
                            Switch Account
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};