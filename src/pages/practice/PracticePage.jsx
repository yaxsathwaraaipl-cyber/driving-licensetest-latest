import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Award,
    Play,
    ChevronRight,
    Filter,
    Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/ui/SearchInput';
import { categoryService } from '../../services/categoryService';

const testTypes = [
    {
        id: 'full',
        name: 'Full Practice Test',
        description: 'Complete test with 50 questions from all categories',
        questions: 50,
        duration: '60 min',
        icon: Award,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        id: 'quick',
        name: 'Quick Practice',
        description: '20 random questions for quick practice',
        questions: 20,
        duration: '25 min',
        icon: Clock,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
    },
    {
        id: 'category',
        name: 'Category Test',
        description: 'Choose a specific category to focus on',
        questions: 30,
        duration: '35 min',
        icon: BookOpen,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
    },
];

export default function PracticePage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Practice Tests</h1>
                <p className="text-gray-500 mt-1">Choose a test to start practicing</p>
            </div>

            {/* Test Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testTypes.map((test) => {
                    const Icon = test.icon;
                    return (
                        <Link key={test.id} to={`/practice/${test.id}`}>
                            <Card className="p-6 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 group cursor-pointer h-full">
                                <div className={`p-3 rounded-xl ${test.iconBg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`h-6 w-6 ${test.iconColor}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{test.description}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            {test.questions} Q
                                        </span>
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {test.duration}
                                        </span>
                                    </div>
                                    <div className={`p-2 rounded-full bg-gradient-to-r ${test.color} group-hover:shadow-lg transition-all`}>
                                        <Play className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Category Practice */}
            <Card>
                <CardHeader>
                    <CardTitle>Practice by Category</CardTitle>
                </CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search categories..."
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories
                        .filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()))
                        .map((category) => (
                            <Link
                                key={category.id}
                                to={`/practice/category/${category.id}`}
                                className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {category.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="info">{category.questionsCount} questions</Badge>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                </div>
            </Card>

            {/* Recent Practice */}
            <Card>
                <CardHeader>
                    <CardTitle>Continue Practice</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <div className="space-y-3">
                    {[
                        { id: 1, name: 'Full Practice Test', progress: 75, questions: '38/50', date: 'Started 2 hours ago' },
                        { id: 2, name: 'Road Signs Practice', progress: 40, questions: '8/20', date: 'Started yesterday' },
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{item.questions} questions • {item.progress}% complete</p>
                                </div>
                            </div>
                            <Link to={`/practice/${item.id}`}>
                                <Button size="sm" className="ml-4">Continue</Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};