import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, GraduationCap, Star, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants';

const loginSchema = z.object({
    credential: z.string().min(1, 'Email or phone number is required'),
    password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, error, clearError } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            clearError();

            const user = await login({
                emailOrPhone: data.credential,
                password: data.password
            });

            // Check role and navigate accordingly
            if (user?.role === 'super_admin') {
                navigate(ROUTES.SUPER_ADMIN.DASHBOARD, { replace: true });
            } else if (user?.role === 'admin') {
                navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
            } else {
                navigate(ROUTES.DASHBOARD, { replace: true });
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left - Blue Brand Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full opacity-20 blur-3xl" />

                <div className="relative flex flex-col justify-center px-16 py-12 text-white w-full">
                    <Link to="/" className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                        <span className="text-2xl font-bold">ClearDrive</span>
                    </Link>

                    <h1 className="text-4xl font-bold mb-6 leading-tight">Ace Your Driving Test With Confidence</h1>
                    <p className="text-blue-200 text-lg mb-12 leading-relaxed">Join 50,000+ learners who passed their driving test on the first try.</p>

                    <div className="space-y-6">
                        {['1000+ practice questions', 'Real test simulation', 'State-specific content', 'Detailed explanations'].map((text, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-blue-300 flex-shrink-0" />
                                <span className="text-blue-100">{text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />)}
                        </div>
                        <p className="text-sm text-blue-100 italic mb-3">"ClearDrive helped me pass my test on the first try!"</p>
                        <p className="text-sm font-semibold">Sarah Johnson</p>
                        <p className="text-xs text-blue-300">Passed with 95% score</p>
                    </div>
                </div>
            </div>

            {/* Right - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
                <div className="w-full max-w-md">
                    <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-10">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">ClearDrive</span>
                    </Link>

                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                            <p className="text-gray-500 mt-2">Please sign in to your account</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email or Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.credential ? 'border-red-300' : ''}`}
                                        placeholder="Enter your email or phone number"
                                        {...register('credential')}
                                    />
                                </div>
                                {errors.credential && <p className="text-sm text-red-600 mt-1.5">{errors.credential.message}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.password ? 'border-red-300' : ''}`}
                                        placeholder="Enter your password"
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-red-600 mt-1.5">{errors.password.message}</p>}
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                Don't have an account?{' '}
                                <Link to={ROUTES.SIGNUP} className="text-blue-600 hover:text-blue-700 font-semibold">
                                    Create free account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}