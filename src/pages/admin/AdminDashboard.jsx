import { useQuery } from '@tanstack/react-query';
import {
    Users,
    BookOpen,
    BarChart3,
    TrendingUp,
    UserPlus,
    FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { userService } from '../../services/userService';
import { questionBankService } from '../../services/questionBankService';
import { categoryService } from '../../services/categoryService';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === 'super_admin';

    // ✅ Fetch users (admins can see users, super admins see all)
    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['dashboard-users'],
        queryFn: userService.getAll,
        enabled: isSuperAdmin, // Only super admin can see all users
    });

    // ✅ Fetch question banks
    const { data: questionBanks, isLoading: qbLoading } = useQuery({
        queryKey: ['dashboard-question-banks'],
        queryFn: questionBankService.getAll,
    });

    // ✅ Fetch categories
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['dashboard-categories'],
        queryFn: categoryService.getAll,
    });

    const isLoading = usersLoading || qbLoading || categoriesLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    // Calculate stats from fetched data
    const totalUsers = users?.length || 0;
    const totalQuestions = questionBanks?.reduce((acc, bank) => acc + (bank.questions?.length || 0), 0) || 0;
    const totalCategories = categories?.length || 0;

    const statCards = [
        {
            title: 'Total Users',
            value: totalUsers,
            icon: Users,
            change: isSuperAdmin ? 'All users' : 'Admin view',
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: 'Total Questions',
            value: totalQuestions,
            icon: BookOpen,
            change: `${questionBanks?.length || 0} banks`,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            title: 'Categories',
            value: totalCategories,
            icon: FileText,
            change: 'Active',
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            title: 'Question Banks',
            value: questionBanks?.length || 0,
            icon: BarChart3,
            change: 'Total banks',
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of your application</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bg}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Users - only if super admin */}
            {isSuperAdmin && users && users.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Users</CardTitle>
                            <Badge variant="primary">New</Badge>
                        </CardHeader>
                        <div className="space-y-4">
                            {users.slice(0, 5).map((user) => (
                                <div key={user._id || user.id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary-700">
                                            {user.fullName?.charAt(0) || user.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{user.fullName || user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <Badge variant={user.role === 'admin' ? 'warning' : 'info'}>
                                        {user.role || 'user'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Questions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Questions</CardTitle>
                            <Badge variant="success">Updated</Badge>
                        </CardHeader>
                        <div className="space-y-4">
                            {questionBanks?.slice(0, 5).map((bank) => (
                                <div key={bank._id} className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium truncate">{bank.title}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="info">{bank.questions?.length || 0} questions</Badge>
                                        <span className="text-xs text-gray-500">
                                            {new Date(bank.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}