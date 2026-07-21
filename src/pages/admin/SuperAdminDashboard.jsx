import { useQuery } from '@tanstack/react-query';
import { Users, UserCog, List, Globe, MapPin, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { adminService } from '../../services/adminService';
import { userService } from '../../services/userService';
import { countryService } from '../../services/countryService';
import { provinceService } from '../../services/provinceService';
import { categoryService } from '../../services/categoryService';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

export default function SuperAdminDashboard() {
    // Fetch all counts with proper error handling
    const { data: admins, isLoading: adminsLoading, error: adminsError, refetch: refetchAdmins } = useQuery({
        queryKey: ['super-admin-admins'],
        queryFn: async () => {
            try {
                const response = await adminService.getAll();
                console.log('Admins data:', response);
                // Filter to only show admins
                const adminUsers = Array.isArray(response) ? response.filter(user => user.role === 'admin') : [];
                console.log('Filtered admins:', adminUsers);
                return adminUsers;
            } catch (error) {
                console.error('Error fetching admins:', error);
                return [];
            }
        },
        // Remove initialData to prevent showing 0
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    const { data: users, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
        queryKey: ['super-admin-users'],
        queryFn: async () => {
            try {
                const response = await userService.getAll();
                console.log('Users data:', response);
                // Filter to only show regular users
                const regularUsers = Array.isArray(response) ? response.filter(user => user.role === 'user') : [];
                console.log('Filtered users:', regularUsers);
                return regularUsers;
            } catch (error) {
                console.error('Error fetching users:', error);
                return [];
            }
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    const { data: countries, isLoading: countriesLoading, refetch: refetchCountries } = useQuery({
        queryKey: ['super-admin-countries'],
        queryFn: async () => {
            try {
                const response = await countryService.getAll();
                return Array.isArray(response) ? response : [];
            } catch (error) {
                console.error('Error fetching countries:', error);
                return [];
            }
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    const { data: provinces, isLoading: provincesLoading, refetch: refetchProvinces } = useQuery({
        queryKey: ['super-admin-provinces'],
        queryFn: async () => {
            try {
                const response = await provinceService.getAll();
                return Array.isArray(response) ? response : [];
            } catch (error) {
                console.error('Error fetching provinces:', error);
                return [];
            }
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
        queryKey: ['super-admin-categories'],
        queryFn: async () => {
            try {
                const response = await categoryService.getAll();
                return Array.isArray(response) ? response : [];
            } catch (error) {
                console.error('Error fetching categories:', error);
                return [];
            }
        },
        retry: 2,
        retryDelay: 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
    });

    const isLoading = adminsLoading || usersLoading || countriesLoading || provincesLoading || categoriesLoading;

    // Log any errors
    if (adminsError) console.error('Admins error:', adminsError);
    if (usersError) console.error('Users error:', usersError);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Admins',
            value: admins?.length || 0,
            icon: UserCog,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            link: ROUTES.SUPER_ADMIN.ADMINS
        },
        {
            title: 'Total Users',
            value: users?.length || 0,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            link: ROUTES.SUPER_ADMIN.USERS
        },
        {
            title: 'Countries',
            value: countries?.length || 0,
            icon: Globe,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            link: ROUTES.SUPER_ADMIN.COUNTRIES
        },
        {
            title: 'Provinces',
            value: provinces?.length || 0,
            icon: MapPin,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            link: ROUTES.SUPER_ADMIN.PROVINCES
        },
        {
            title: 'Traffic Categories',
            value: categories?.length || 0,
            icon: List,
            color: 'text-green-600',
            bg: 'bg-green-100',
            link: ROUTES.SUPER_ADMIN.TRAFFIC_CATEGORIES
        },
    ];

    const superAdminCount = 1;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Complete system management dashboard</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link to={stat.link} key={stat.title}>
                            <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.title}</p>
                                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            to={ROUTES.SUPER_ADMIN.ADMINS}
                            className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                        >
                            <UserCog className="h-6 w-6 text-purple-600 mb-2" />
                            <p className="font-medium text-sm">Manage Admins</p>
                            <p className="text-xs text-gray-500 mt-1">Add, edit, or remove admins</p>
                        </Link>
                        <Link
                            to={ROUTES.SUPER_ADMIN.USERS}
                            className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                            <Users className="h-6 w-6 text-blue-600 mb-2" />
                            <p className="font-medium text-sm">Manage Users</p>
                            <p className="text-xs text-gray-500 mt-1">View all users and their tests</p>
                        </Link>
                        <Link
                            to={ROUTES.SUPER_ADMIN.COUNTRIES}
                            className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                            <Globe className="h-6 w-6 text-emerald-600 mb-2" />
                            <p className="font-medium text-sm">Manage Countries</p>
                            <p className="text-xs text-gray-500 mt-1">Add or remove countries</p>
                        </Link>
                        <Link
                            to={ROUTES.SUPER_ADMIN.PROVINCES}
                            className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                        >
                            <MapPin className="h-6 w-6 text-amber-600 mb-2" />
                            <p className="font-medium text-sm">Manage Provinces</p>
                            <p className="text-xs text-gray-500 mt-1">Add or remove provinces</p>
                        </Link>
                        <Link
                            to={ROUTES.SUPER_ADMIN.TRAFFIC_CATEGORIES}
                            className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors col-span-2"
                        >
                            <List className="h-6 w-6 text-green-600 mb-2" />
                            <p className="font-medium text-sm">Manage Traffic Categories</p>
                            <p className="text-xs text-gray-500 mt-1">Create and manage traffic sign categories</p>
                        </Link>
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-purple-600" />
                                <span className="text-sm">Super Admins</span>
                            </div>
                            <Badge variant="primary">{superAdminCount}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <UserCog className="h-5 w-5 text-amber-600" />
                                <span className="text-sm">Admins</span>
                            </div>
                            <Badge variant="warning">{admins?.length || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-600" />
                                <span className="text-sm">Users</span>
                            </div>
                            <Badge variant="info">{users?.length || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-emerald-600" />
                                <span className="text-sm">Countries</span>
                            </div>
                            <Badge variant="success">{countries?.length || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-amber-600" />
                                <span className="text-sm">Provinces</span>
                            </div>
                            <Badge variant="warning">{provinces?.length || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <List className="h-5 w-5 text-green-600" />
                                <span className="text-sm">Traffic Categories</span>
                            </div>
                            <Badge variant="success">{categories?.length || 0}</Badge>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}