import { forwardRef } from 'react';

export const Select = forwardRef(({
    label,
    error,
    options = [],
    className = '',
    ...props
}, ref) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`input-field ${error ? 'border-red-500' : ''} ${className}`}
                {...props}
            >
                <option value="">Select...</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';