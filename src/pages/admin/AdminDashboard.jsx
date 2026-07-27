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
import { reportService } from '../../services/reportService';

export default function AdminDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: reportService.getDashboardStats,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers,
            icon: Users,
            change: '+12%',
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: 'Total Questions',
            value: stats?.totalQuestions,
            icon: BookOpen,
            change: '+5%',
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            title: 'Categories',
            value: stats?.totalCategories,
            icon: FileText,
            change: 'Active',
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            title: 'Pass Rate',
            value: `${stats?.testStats?.averageScore || 0}%`,
            icon: TrendingUp,
            change: `${stats?.testStats?.passed || 0} passed`,
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                        <Badge variant="primary">New</Badge>
                    </CardHeader>
                    <div className="space-y-4">
                        {stats?.recentUsers?.map((user) => (
                            <div key={user.id} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary-700">
                                        {user.name.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <Badge variant={user.role === 'admin' ? 'warning' : 'info'}>
                                    {user.role}
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
                        {stats?.recentQuestions?.map((question) => (
                            <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium truncate">{question.question}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="info">{question.difficulty}</Badge>
                                    <span className="text-xs text-gray-500">
                                        {new Date(question.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};