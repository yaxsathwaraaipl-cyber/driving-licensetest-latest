export const Card = ({ children, className = '', hover = true, padding = true }) => {
    return (
        <div className={`
      bg-white rounded-xl shadow-sm border border-gray-100
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            {children}
        </div>
    );
};

export const CardTitle = ({ children, className = '' }) => {
    return (
        <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
            {children}
        </h3>
    );
};