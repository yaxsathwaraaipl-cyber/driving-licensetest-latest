import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Bell, Shield, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

const settingsSchema = z.object({
    siteName: z.string().min(2),
    contactEmail: z.string().email(),
    maxQuestionsPerTest: z.number().min(10).max(100),
    passingScore: z.number().min(50).max(100),
    testDuration: z.number().min(15).max(120),
});

export default function SettingsPage() {
    const [isSaved, setIsSaved] = useState(false);
    const { user } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            siteName: 'ClearDrive',
            contactEmail: 'admin@drivetest.com',
            maxQuestionsPerTest: 50,
            passingScore: 80,
            testDuration: 60,
        },
    });

    const onSubmit = (data) => {
        console.log('Settings saved:', data);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Configure application settings</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary-600" />
                            <CardTitle>General Settings</CardTitle>
                        </div>
                    </CardHeader>
                    <div className="space-y-4">
                        <Input
                            label="Site Name"
                            {...register('siteName')}
                            error={errors.siteName?.message}
                        />
                        <Input
                            label="Contact Email"
                            type="email"
                            {...register('contactEmail')}
                            error={errors.contactEmail?.message}
                        />
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary-600" />
                            <CardTitle>Test Configuration</CardTitle>
                        </div>
                    </CardHeader>
                    <div className="space-y-4">
                        <Input
                            label="Maximum Questions Per Test"
                            type="number"
                            {...register('maxQuestionsPerTest', { valueAsNumber: true })}
                            error={errors.maxQuestionsPerTest?.message}
                        />
                        <Input
                            label="Passing Score (%)"
                            type="number"
                            {...register('passingScore', { valueAsNumber: true })}
                            error={errors.passingScore?.message}
                        />
                        <Input
                            label="Test Duration (minutes)"
                            type="number"
                            {...register('testDuration', { valueAsNumber: true })}
                            error={errors.testDuration?.message}
                        />
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary-600" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                    </CardHeader>
                    <div className="space-y-4">
                        {['Email notifications', 'Push notifications', 'Test reminders'].map((item) => (
                            <label key={item} className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-700">{item}</span>
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    defaultChecked
                                />
                            </label>
                        ))}
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" icon={isSaved ? null : Save}>
                        {isSaved ? 'Saved!' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
};