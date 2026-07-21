import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { reportService } from '../../services/reportService';

export default function ReportsPage() {
    const { data: userAnalytics } = useQuery({
        queryKey: ['user-analytics'],
        queryFn: reportService.getUserAnalytics,
    });

    const { data: questionAnalytics } = useQuery({
        queryKey: ['question-analytics'],
        queryFn: reportService.getQuestionAnalytics,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600 mt-1">Analytics and insights</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Users by Role</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        {userAnalytics?.byRole?.map((item) => (
                            <div key={item.role}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">{item.role}</span>
                                    <span className="font-medium">{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full"
                                        style={{
                                            width: `${(item.count / (userAnalytics?.byRole?.reduce((a, b) => a + b.count, 0) || 1)) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Questions by Category</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        {questionAnalytics?.byCategory?.map((item) => (
                            <div key={item.category}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">{item.category}</span>
                                    <span className="font-medium">{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: `${(item.count / Math.max(...questionAnalytics.byCategory.map(c => c.count))) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};