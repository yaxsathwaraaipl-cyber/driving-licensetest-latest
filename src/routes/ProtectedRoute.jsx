// routes/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children, roles }) => {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();

    console.log('ProtectedRoute - user:', user?.role, 'isAuthenticated:', isAuthenticated, 'path:', location.pathname, 'allowed roles:', roles);

    // If no user, redirect to login
    if (!user || !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ✅ SUPER ADMIN has access to EVERYTHING - check for both 'super_admin' and 'superadmin'
    if (user.role === 'super_admin' || user.role === 'superadmin') {
        console.log('Super Admin - allowing access to:', location.pathname);
        return children;
    }

    // If roles are specified, check if user has required role
    if (roles && roles.length > 0) {
        const hasRequiredRole = roles.includes(user.role);

        if (!hasRequiredRole) {
            console.log('User does not have required role. Redirecting...');
            // Redirect based on user role
            if (user.role === 'admin') {
                return <Navigate to="/admin/dashboard" replace />;
            } else {
                return <Navigate to="/dashboard" replace />;
            }
        }
    }

    // User is authenticated and has required role
    return children;
};