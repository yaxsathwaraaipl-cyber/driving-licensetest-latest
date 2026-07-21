import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, BarChart3, User, Settings, LogOut,
    Menu, X, Bell, ChevronDown, GraduationCap, Users, HelpCircle,
    Flag, FileText, Shield, UserCog, List, Globe, MapPin,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants';

// ✅ User Navigation (Regular Users)
const userNavigation = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Practice', href: ROUTES.PRACTICE, icon: BookOpen },
    { name: 'Results', href: ROUTES.RESULTS, icon: BarChart3 },
    { name: 'Profile', href: ROUTES.PROFILE, icon: User },
];

// ✅ Admin Navigation
const adminNavigation = [
    { name: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { name: 'Users', href: ROUTES.ADMIN.USERS, icon: Users },
    { name: 'Province Master', href: ROUTES.ADMIN.STATES, icon: Flag },
    { name: 'Traffic Signs', href: ROUTES.ADMIN.QUESTIONS, icon: FileText },
    { name: 'Question Banks', href: ROUTES.ADMIN.QUESTION_BANKS, icon: BookOpen },
    { name: 'Test Management', href: ROUTES.ADMIN.TESTS, icon: FileText },
    { name: 'Profile', href: ROUTES.PROFILE, icon: User },
];

// ✅ Super Admin Navigation
const superAdminNavigation = [
    { name: 'Dashboard', href: ROUTES.SUPER_ADMIN.DASHBOARD, icon: LayoutDashboard },
    { name: 'Manage Admins', href: ROUTES.SUPER_ADMIN.ADMINS, icon: UserCog },
    { name: 'Manage Users', href: ROUTES.SUPER_ADMIN.USERS, icon: Users },
    { name: 'Question Banks', href: ROUTES.SUPER_ADMIN.QUESTION_BANKS, icon: BookOpen },
    { name: 'Test Categories', href: ROUTES.SUPER_ADMIN.TEST_CATEGORIES, icon: List },
    { name: 'Countries', href: ROUTES.SUPER_ADMIN.COUNTRIES, icon: Globe },
    { name: 'Provinces', href: ROUTES.SUPER_ADMIN.PROVINCES, icon: MapPin },
    { name: 'Traffic Categories', href: ROUTES.SUPER_ADMIN.TRAFFIC_CATEGORIES, icon: List },
    { name: 'Traffic Signs', href: ROUTES.SUPER_ADMIN.TRAFFIC_SIGNS, icon: FileText },
    { name: 'Profile', href: ROUTES.PROFILE, icon: User },
];

export const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    console.log('DashboardLayout rendered, location:', location.pathname);

    // Get navigation based on user role
    const getNavigation = () => {
        switch (user?.role) {
            case 'super_admin':
                return superAdminNavigation;
            case 'admin':
                return adminNavigation;
            default:
                return userNavigation;
        }
    };

    const navigation = getNavigation();

    const getRoleBadge = () => {
        switch (user?.role) {
            case 'super_admin':
                return { text: 'Super Admin', color: 'bg-purple-100 text-purple-700' };
            case 'admin':
                return { text: 'Admin', color: 'bg-amber-100 text-amber-700' };
            default:
                return { text: 'User', color: 'bg-blue-100 text-blue-700' };
        }
    };

    const roleBadge = getRoleBadge();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // ✅ Only redirect if user is on wrong dashboard
    useEffect(() => {
        if (user?.role === 'super_admin' && location.pathname === '/admin/dashboard') {
            navigate('/super-admin/dashboard', { replace: true });
        }
        if (user?.role === 'admin' && location.pathname === '/super-admin/dashboard') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user?.role, location.pathname, navigate]);

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
                transform transition-transform duration-200 ease-in-out
                lg:relative lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">ClearDrive</span>
                        <button
                            className="lg:hidden ml-auto text-gray-400"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">
                                    {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.fullName || user?.name || 'User'}
                                </p>
                                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 ${roleBadge.color}`}>
                                    {roleBadge.text}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                        ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
                    <button
                        className="lg:hidden text-gray-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg"
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-700">
                                        {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-gray-700">
                                    {user?.fullName || user?.name || 'User'}
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium">{user?.fullName || user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">{roleBadge.text}</p>
                                        </div>
                                        <Link
                                            to={ROUTES.PROFILE}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => { setProfileOpen(false); handleLogout(); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};