import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User,
    Mail,
    Phone,
    Save,
    Lock,
    Shield,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

const profileSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    mobile: z.string().min(10, 'Valid mobile required'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function AdminProfile() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
    const { user, updateUser } = useAuthStore();

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors, isDirty: isProfileDirty },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            mobile: user?.mobile || '',
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
    } = useForm({
        resolver: zodResolver(passwordSchema),
    });

    const onProfileSubmit = async (data) => {
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });
        try {
            const updatedUser = await authService.updateProfile(data);
            updateUser(updatedUser);
            setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setIsSaving(false);
        }
    };

    const onPasswordSubmit = async (data) => {
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (data.currentPassword !== 'admin123') {
                throw new Error('Current password is incorrect');
            }

            await authService.updateProfile({ password: data.newPassword });

            setSaveMessage({ type: 'success', text: 'Password changed successfully!' });
            resetPassword();
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
                <p className="text-gray-500 mt-1">Manage your admin account settings</p>
            </div>

            {/* Profile Header */}
            <Card>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                            <Badge variant="warning">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                            </Badge>
                        </div>
                        <p className="text-gray-500 mt-1">{user?.email}</p>
                        {user?.mobile && (
                            <p className="text-gray-500 text-sm">{user?.mobile}</p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <Card padding={false}>
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <User className="h-4 w-4" />
                            Edit Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'password'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Lock className="h-4 w-4" />
                            Change Password
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Save Message */}
                    {saveMessage.text && (
                        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${saveMessage.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {saveMessage.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            )}
                            <span className="text-sm">{saveMessage.text}</span>
                        </div>
                    )}

                    {/* Edit Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4 max-w-2xl">
                            <Input
                                label="Full Name"
                                icon={User}
                                placeholder="Enter your full name"
                                {...registerProfile('name')}
                                error={profileErrors.name?.message}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                icon={Mail}
                                placeholder="Enter your email"
                                {...registerProfile('email')}
                                error={profileErrors.email?.message}
                            />
                            <Input
                                label="Mobile Number"
                                type="tel"
                                icon={Phone}
                                placeholder="+1 234 567 8900"
                                {...registerProfile('mobile')}
                                error={profileErrors.mobile?.message}
                            />
                            <div className="pt-4 flex items-center gap-3">
                                <Button type="submit" icon={Save} isLoading={isSaving} disabled={!isProfileDirty}>
                                    Save Changes
                                </Button>
                                {isProfileDirty && (
                                    <span className="text-sm text-gray-500">You have unsaved changes</span>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-2xl">
                            <PasswordInput
                                label="Current Password"
                                placeholder="Enter current password"
                                {...registerPassword('currentPassword')}
                                error={passwordErrors.currentPassword?.message}
                            />
                            <PasswordInput
                                label="New Password"
                                placeholder="Enter new password"
                                {...registerPassword('newPassword')}
                                error={passwordErrors.newPassword?.message}
                            />
                            <PasswordInput
                                label="Confirm New Password"
                                placeholder="Confirm new password"
                                {...registerPassword('confirmPassword')}
                                error={passwordErrors.confirmPassword?.message}
                            />
                            <div className="pt-4">
                                <Button type="submit" icon={Save} isLoading={isSaving}>
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
};