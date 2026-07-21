import { useQuery } from '@tanstack/react-query';
import { BookOpen, TrendingUp, Award, Clock, Play, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { userService } from '../../services/userService';

export default function DashboardPage() {
    const { user } = useAuthStore();

    // Fetch user stats
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['user-stats'],
        queryFn: async () => {
            try {
                const response = await userService.getStats();
                return response.data;
            } catch (error) {
                console.error('Error fetching stats:', error);
                // Return default values if API fails
                return {
                    testsTaken: 0,
                    averageScore: 0,
                    testsPassed: 0,
                    practiceTime: '0h',
                    recentActivity: [],
                    recommendedTests: [],
                    progress: {
                        roadSigns: 0,
                        trafficRules: 0,
                        safeDriving: 0,
                        parking: 0,
                    }
                };
            }
        },
        initialData: {
            testsTaken: 0,
            averageScore: 0,
            testsPassed: 0,
            practiceTime: '0h',
            recentActivity: [],
            recommendedTests: [],
            progress: {
                roadSigns: 0,
                trafficRules: 0,
                safeDriving: 0,
                parking: 0,
            }
        }
    });

    // Fetch recent activity
    const { data: recentActivity } = useQuery({
        queryKey: ['recent-activity'],
        queryFn: async () => {
            try {
                const response = await userService.getRecentActivity();
                return response.data || [];
            } catch (error) {
                console.error('Error fetching recent activity:', error);
                return [];
            }
        },
        initialData: []
    });

    // Fetch recommended tests
    const { data: recommendedTests } = useQuery({
        queryKey: ['recommended-tests'],
        queryFn: async () => {
            try {
                const response = await userService.getRecommendedTests();
                return response.data || [];
            } catch (error) {
                console.error('Error fetching recommended tests:', error);
                return [];
            }
        },
        initialData: []
    });

    // Stat cards with dynamic data
    const statCards = [
        {
            title: 'Tests Taken',
            value: stats?.testsTaken || 0,
            icon: BookOpen,
            change: stats?.testsTakenThisWeek ? `+${stats.testsTakenThisWeek} this week` : 'No tests yet',
            color: 'text-primary-600',
            bg: 'bg-primary-100',
        },
        {
            title: 'Average Score',
            value: stats?.averageScore ? `${stats.averageScore}%` : '0%',
            icon: TrendingUp,
            change: stats?.scoreImprovement ? `+${stats.scoreImprovement}% improvement` : 'Start practicing',
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            title: 'Tests Passed',
            value: stats?.testsPassed || 0,
            icon: Award,
            change: stats?.passRate ? `${stats.passRate}% pass rate` : 'No tests passed',
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
        },
        {
            title: 'Practice Time',
            value: stats?.practiceTime || '0h',
            icon: Clock,
            change: stats?.practiceTimeThisWeek || 'Start practicing',
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
    ];

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.fullName || 'User'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Continue your test preparation journey
                    </p>
                </div>
                <Link to={ROUTES.PRACTICE}>
                    <Button className="flex items-center gap-2" size="lg">
                        <Play className="h-4 w-4" />
                        Start New Test
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.change}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bg}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Continue Practice */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Continue Practice</CardTitle>
                            <Badge variant="primary">In Progress</Badge>
                        </CardHeader>
                        <div className="space-y-4">
                            {stats?.inProgressTest ? (
                                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{stats.inProgressTest.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {stats.inProgressTest.questions} questions • {stats.inProgressTest.category}
                                            </p>
                                            <div className="mt-3">
                                                <div className="w-full bg-primary-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full"
                                                        style={{ width: `${stats.inProgressTest.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {stats.inProgressTest.progress}% complete - {stats.inProgressTest.completed}/{stats.inProgressTest.questions} questions
                                                </p>
                                            </div>
                                        </div>
                                        <Link to={ROUTES.PRACTICE}>
                                            <Button size="sm">Continue</Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                                    <p className="text-gray-500">No test in progress. Start a new test!</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Link to={ROUTES.PRACTICE}>
                                    <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group">
                                        <BookOpen className="h-5 w-5 text-primary-600 mb-2" />
                                        <h4 className="font-medium group-hover:text-primary-600">Quick Practice</h4>
                                        <p className="text-sm text-gray-600">20 random questions</p>
                                    </div>
                                </Link>
                                <Link to={ROUTES.PRACTICE}>
                                    <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group">
                                        <Award className="h-5 w-5 text-primary-600 mb-2" />
                                        <h4 className="font-medium group-hover:text-primary-600">Category Test</h4>
                                        <p className="text-sm text-gray-600">Choose a specific topic</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Recommended Tests */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended Tests</CardTitle>
                            <Link to={ROUTES.PRACTICE} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                                View All <ChevronRight className="h-4 w-4" />
                            </Link>
                        </CardHeader>
                        <div className="space-y-3">
                            {recommendedTests.length > 0 ? (
                                recommendedTests.slice(0, 4).map((test) => (
                                    <Link
                                        key={test.id || test._id}
                                        to={ROUTES.PRACTICE}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">{test.name}</h4>
                                                <p className="text-xs text-gray-500">{test.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{test.questions} Q</p>
                                            <p className="text-xs text-gray-500">{test.duration}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-500">No recommended tests available</p>
                                    <Link to={ROUTES.PRACTICE} className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
                                        Browse all tests
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? (
                                recentActivity.slice(0, 5).map((activity) => (
                                    <div key={activity.id || activity._id} className="flex items-start gap-3">
                                        <div className={`
                                            p-2 rounded-lg flex-shrink-0
                                            ${activity.type === 'test' ? 'bg-green-100' : 'bg-blue-100'}
                                        `}>
                                            {activity.type === 'test' ? (
                                                <Award className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <BookOpen className="h-4 w-4 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{activity.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {activity.score && (
                                                    <Badge variant="success" className="text-xs">{activity.score}</Badge>
                                                )}
                                                {activity.questions && (
                                                    <Badge variant="info" className="text-xs">{activity.questions} Q</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-500">No recent activity</p>
                                    <p className="text-sm text-gray-400 mt-1">Start practicing to see your progress</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Link
                                to="/results"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                                View all activity <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </Card>

                    {/* Quick Stats - Progress by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Progress</CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            {stats?.progress ? (
                                Object.entries(stats.progress).map(([category, value]) => (
                                    <div key={category}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">
                                                {category.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="font-medium text-gray-900">{value}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${value >= 80 ? 'bg-green-500' :
                                                        value >= 60 ? 'bg-primary-500' :
                                                            value >= 40 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                    }`}
                                                style={{ width: `${value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-500">No progress data available</p>
                                    <p className="text-sm text-gray-400 mt-1">Start taking tests to track your progress</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}