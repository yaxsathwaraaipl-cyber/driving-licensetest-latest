import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Smartphone, AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, Shield, Award, CheckCircle, Globe, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants';
import { countryService } from '../../services/countryService';
import { provinceService } from '../../services/provinceService';

const signupSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid mobile number required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    countryId: z.string().min(1, 'Please select a country'),
    provinceId: z.string().min(1, 'Please select a province'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [countries, setCountries] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const { signup, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            countryId: '',
            provinceId: '',
        }
    });

    const password = watch('password');
    const selectedCountryId = watch('countryId');

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const data = await countryService.getAll();
                setCountries(data || []);
            } catch (error) {
                console.error('Error fetching countries:', error);
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch provinces when country changes
    useEffect(() => {
        const fetchProvinces = async () => {
            if (!selectedCountryId) {
                setProvinces([]);
                setValue('provinceId', '');
                return;
            }

            setLoadingProvinces(true);
            try {
                const data = await provinceService.getByCountry(selectedCountryId);
                setProvinces(data || []);
                setValue('provinceId', '');
            } catch (error) {
                console.error('Error fetching provinces:', error);
                setProvinces([]);
            } finally {
                setLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, [selectedCountryId, setValue]);

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { strength: 0, checks: [] };
        const checks = [
            { met: pwd.length >= 8, label: '8+ characters' },
            { met: /[A-Z]/.test(pwd), label: 'Uppercase' },
            { met: /[a-z]/.test(pwd), label: 'Lowercase' },
            { met: /[0-9]/.test(pwd), label: 'Number' },
        ];
        return { strength: checks.filter(c => c.met).length, checks };
    };

    const passwordStrength = getPasswordStrength(password);

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            clearError();

            // Map form data to API expected fields
            const userData = {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                countryId: data.countryId,
                provinceId: data.provinceId,
            };

            console.log('Signup data being sent:', userData);

            const response = await signup(userData);

            if (response?.success) {
                navigate(ROUTES.LOGIN, {
                    replace: true,
                    state: { message: 'Account created successfully! Please sign in.' }
                });
            }
        } catch (error) {
            console.error('Signup error:', error);
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

                <div className="relative flex flex-col px-16 py-12 text-white w-full">
                    <Link to="/" className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                        <span className="text-2xl font-bold">ClearDrive</span>
                    </Link>

                    <h1 className="text-4xl font-bold mb-6 leading-tight">Start Your Journey to Getting Licensed</h1>
                    <p className="text-blue-200 text-lg mb-12 leading-relaxed">Create your free account and get access to 1000+ practice questions.</p>

                    <div className="space-y-4">
                        {[
                            { icon: Shield, text: 'Full access to all practice tests' },
                            { icon: Award, text: 'Track progress with analytics' },
                            { icon: CheckCircle, text: 'State-specific questions' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <item.icon className="h-5 w-5 text-blue-300 flex-shrink-0" />
                                <span className="text-blue-100">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right - Signup Form */}
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
                            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                            <p className="text-gray-500 mt-2">Get started with your free account</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.fullName ? 'border-red-300' : ''}`}
                                        placeholder="John Doe"
                                        {...register('fullName')}
                                    />
                                </div>
                                {errors.fullName && <p className="text-sm text-red-600 mt-1.5">{errors.fullName.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.email ? 'border-red-300' : ''}`}
                                        placeholder="john@example.com"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-600 mt-1.5">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Smartphone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.phone ? 'border-red-300' : ''}`}
                                        placeholder="Enter your phone number"
                                        {...register('phone')}
                                    />
                                </div>
                                {errors.phone && <p className="text-sm text-red-600 mt-1.5">{errors.phone.message}</p>}
                            </div>

                            {/* Country Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.countryId ? 'border-red-300' : ''}`}
                                        {...register('countryId')}
                                        disabled={loadingCountries}
                                    >
                                        <option value="">{loadingCountries ? 'Loading countries...' : 'Select Country'}</option>
                                        {countries.map((country) => (
                                            <option key={country._id || country.id} value={country._id || country.id}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.countryId && <p className="text-sm text-red-600 mt-1.5">{errors.countryId.message}</p>}
                            </div>

                            {/* Province Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Province / State</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.provinceId ? 'border-red-300' : ''}`}
                                        {...register('provinceId')}
                                        disabled={!selectedCountryId || loadingProvinces}
                                    >
                                        <option value="">
                                            {!selectedCountryId
                                                ? 'Please select a country first'
                                                : loadingProvinces
                                                    ? 'Loading provinces...'
                                                    : 'Select Province'
                                            }
                                        </option>
                                        {provinces.map((province) => (
                                            <option key={province._id || province.id} value={province._id || province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.provinceId && <p className="text-sm text-red-600 mt-1.5">{errors.provinceId.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.password ? 'border-red-300' : ''}`}
                                        placeholder="Create password"
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
                                {password && (
                                    <div className="mt-3">
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full ${level <= passwordStrength.strength
                                                        ? level <= 2
                                                            ? 'bg-red-500'
                                                            : level <= 3
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'
                                                        : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {passwordStrength.checks.map((check, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-xs px-2 py-1 rounded ${check.met
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-400'
                                                        }`}
                                                >
                                                    {check.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className={`w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none hover:border-gray-300 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                                        placeholder="Confirm password"
                                        {...register('confirmPassword')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-sm text-red-600 mt-1.5">{errors.confirmPassword.message}</p>}
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
                                        Create Account
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Already have an account?{' '}
                                <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-700 font-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}