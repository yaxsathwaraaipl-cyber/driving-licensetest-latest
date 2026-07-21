import { FileText, Users, BookOpen, Inbox, Search } from 'lucide-react';
import { Button } from './Button';

const icons = {
    file: FileText,
    users: Users,
    book: BookOpen,
    inbox: Inbox,
    search: Search,
};

export const EmptyState = ({
    icon = 'inbox',
    title = 'No data found',
    description = 'There are no items to display yet.',
    actionLabel,
    onAction,
    className = '',
}) => {
    const Icon = icons[icon] || Inbox;

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
};