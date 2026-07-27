import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LandingLayout } from '../layouts/LandingLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from '../constants';

// ====== LAZY LOADED PAGES (from second file) ======
const LandingPage = lazy(() => import('../pages/landing/LandingPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const PracticePage = lazy(() => import('../pages/practice/PracticePage'));
const PracticeTestPage = lazy(() => import('../pages/practice/PracticeTestPage'));
const UserProfilePage = lazy(() => import('../pages/profile/UserProfilePage'));
const ResultsPage = lazy(() => import('../pages/results/ResultsPage'));
const ResultDetailPage = lazy(() => import('../pages/results/ResultDetailPage'));

// Admin Components (from second file)
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const QuestionsPage = lazy(() => import('../pages/admin/QuestionsPage'));
const CategoriesPage = lazy(() => import('../pages/admin/CategoriesPage'));
const StatesPage = lazy(() => import('../pages/admin/StatesPage'));
const ReportsPage = lazy(() => import('../pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'));
const AdminProfilePage = lazy(() => import('../pages/admin/AdminProfile'));

// Super Admin Components (from second file)
const SuperAdminDashboard = lazy(() => import('../pages/admin/SuperAdminDashboard'));
const SuperAdminAdminsPage = lazy(() => import('../pages/admin/SuperAdminAdminsPage'));
const TrafficCategories = lazy(() => import('../pages/admin/TrafficCategories'));
const Countries = lazy(() => import('../pages/admin/Countries'));
const Provinces = lazy(() => import('../pages/admin/Provinces'));
const SuperAdminUserDetail = lazy(() => import('../pages/admin/SuperAdminUserDetail'));

// Error Pages (from second file)
const NotFoundPage = lazy(() => import('../pages/error/NotFoundPage'));
const ServerErrorPage = lazy(() => import('../pages/error/ServerErrorPage'));
const ForbiddenPage = lazy(() => import('../pages/error/ForbiddenPage'));

// Shared Admin Components (from second file)
const QuestionBanksPage = lazy(() => import('../pages/admin/QuestionBanksPage'));
const QuestionBankDetailPage = lazy(() => import('../pages/admin/QuestionBankDetailPage'));
const AddQuestionsPage = lazy(() => import('../pages/admin/AddQuestionsPage'));
const EditQuestionPage = lazy(() => import('../pages/admin/EditQuestionPage'));
const TestCategoriesPage = lazy(() => import('../pages/admin/TestCategoriesPage'));
const TrafficSignsPage = lazy(() => import('../pages/admin/TrafficSignsPage'));
const CreateEditTrafficSignPage = lazy(() => import('../pages/admin/CreateEditTrafficSignPage'));
const TestManagementPage = lazy(() => import('../pages/admin/TestManagementPage'));
const CreateEditTestPage = lazy(() => import('../pages/admin/CreateEditTestPage'));
const PracticeTestManagementPage = lazy(() => import('../pages/admin/PracticeTestManagementPage'));
const CreateEditPracticeTestPage = lazy(() => import('../pages/admin/CreateEditPracticeTestPage'));
const TestDetailPage = lazy(() => import('../pages/admin/TestDetailPage'));

// ====== ADDITIONAL IMPORTS FROM FIRST FILE ======
// User Pages (from admin folder - first file)
const UserTrafficSignsPage = lazy(() => import('../pages/admin/UserTrafficSignsPage'));
const UserPracticeTestList = lazy(() => import('../pages/admin/UserPracticeTestList'));
const UserTestList = lazy(() => import('../pages/admin/UserTestList'));
const UserMaterial = lazy(() => import('../pages/admin/UserMaterial'));
const UserMaterialsReadOnly = lazy(() => import('../pages/admin/UserMaterialsReadOnly'));
const PracticeTestStart = lazy(() => import('../pages/admin/PracticeTestStart'));
const TestStart = lazy(() => import('../pages/admin/TestStart'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

export default function AppRoutes() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* ====== PUBLIC ROUTES (from second file) ====== */}
                <Route element={<LandingLayout />}>
                    <Route path={ROUTES.HOME} element={<LandingPage />} />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
                </Route>

                {/* ====== USER ROUTES (from second file) ====== */}
                <Route element={<ProtectedRoute roles={['user', 'admin', 'super_admin']}><DashboardLayout /></ProtectedRoute>}>
                    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                    <Route path={ROUTES.PRACTICE} element={<PracticePage />} />
                    <Route path={ROUTES.PRACTICE_TEST} element={<PracticeTestPage />} />
                    <Route path={ROUTES.PROFILE} element={<UserProfilePage />} />
                    <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
                    <Route path={ROUTES.RESULTS_DETAIL} element={<ResultDetailPage />} />

                    {/* ====== ADDITIONAL USER ROUTES FROM FIRST FILE ====== */}
                    <Route path={ROUTES.USER.TRAFFIC_SIGNS} element={<UserTrafficSignsPage />} />
                    <Route path={ROUTES.USER.MATERIALS} element={<UserMaterialsReadOnly />} />
                    <Route path={ROUTES.USER.TESTS} element={<UserTestList />} />
                    <Route path={ROUTES.USER.TEST_START} element={<TestStart />} />
                    <Route path={ROUTES.USER.PRACTICE_TESTS} element={<UserPracticeTestList />} />
                    <Route path={ROUTES.USER.PRACTICE_TEST_START} element={<PracticeTestStart />} />

                    {/* <Route path="/user/traffic-signs" element={<UserTrafficSignsPage />} />
                    <Route path="/user/materials" element={<UserMaterialsReadOnly />} />
                    <Route path="/user/tests" element={<UserTestList />} />
                    <Route path="/user/test/start/:testId" element={<TestStart />} />
                    <Route path="/user/practice-tests" element={<UserPracticeTestList />} />
                    <Route path="/user/practice-test/start/:practiceTestId" element={<PracticeTestStart />} /> */}
                    |
                </Route>

                {/* ====== ADMIN ROUTES (from second file - KEPT AS IS) ====== */}
                <Route element={<ProtectedRoute roles={['admin', 'super_admin']}><DashboardLayout /></ProtectedRoute>}>
                    <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
                    <Route path={ROUTES.ADMIN.USERS} element={<UsersPage />} />
                    <Route path={ROUTES.ADMIN.QUESTIONS} element={<QuestionsPage />} />
                    <Route path={ROUTES.ADMIN.CATEGORIES} element={<CategoriesPage />} />
                    <Route path={ROUTES.ADMIN.STATES} element={<StatesPage />} />
                    <Route path={ROUTES.ADMIN.REPORTS} element={<ReportsPage />} />
                    <Route path={ROUTES.ADMIN.SETTINGS} element={<SettingsPage />} />
                    <Route path="/admin/profile" element={<AdminProfilePage />} />
                    <Route path={ROUTES.ADMIN.QUESTION_BANKS} element={<QuestionBanksPage />} />
                    <Route path={ROUTES.ADMIN.QUESTION_BANK_DETAIL} element={<QuestionBankDetailPage />} />
                    <Route path={ROUTES.ADMIN.QUESTION_BANK_ADD_QUESTIONS} element={<AddQuestionsPage />} />
                    <Route path={ROUTES.ADMIN.QUESTION_BANK_EDIT_QUESTION} element={<EditQuestionPage />} />
                    <Route path={ROUTES.ADMIN.TEST_CATEGORIES} element={<TestCategoriesPage />} />
                    <Route path={ROUTES.ADMIN.TRAFFIC_SIGNS} element={<TrafficSignsPage />} />
                    <Route path={ROUTES.ADMIN.TRAFFIC_SIGNS_CREATE} element={<CreateEditTrafficSignPage />} />
                    <Route path={ROUTES.ADMIN.TRAFFIC_SIGNS_EDIT} element={<CreateEditTrafficSignPage />} />
                    <Route path={ROUTES.ADMIN.TESTS} element={<TestManagementPage />} />
                    <Route path={ROUTES.ADMIN.TESTS_CREATE} element={<CreateEditTestPage />} />
                    <Route path={ROUTES.ADMIN.TESTS_EDIT} element={<CreateEditTestPage />} />
                    <Route path={ROUTES.ADMIN.PRACTICE_TESTS} element={<PracticeTestManagementPage />} />
                    <Route path={ROUTES.ADMIN.PRACTICE_TESTS_CREATE} element={<CreateEditPracticeTestPage />} />
                    <Route path={ROUTES.ADMIN.PRACTICE_TESTS_EDIT} element={<CreateEditPracticeTestPage />} />
                    <Route path={ROUTES.ADMIN.TEST_DETAIL} element={<TestDetailPage />} />
                    <Route path={ROUTES.ADMIN.PROVINCES} element={<Provinces />} />
                    <Route path={ROUTES.ADMIN.TRAFFIC_SIGNS} element={<TrafficSignsPage />} />

                    {/* ====== ADDITIONAL ADMIN ROUTE FROM FIRST FILE ====== */}
                    <Route path={ROUTES.ADMIN.USER_MATERIALS} element={<UserMaterial />} />
                </Route>

                {/* ====== SUPER ADMIN ROUTES (from second file - KEPT AS IS) ====== */}
                <Route element={<ProtectedRoute roles={['super_admin']}><DashboardLayout /></ProtectedRoute>}>
                    <Route path={ROUTES.SUPER_ADMIN.DASHBOARD} element={<SuperAdminDashboard />} />
                    <Route path={ROUTES.SUPER_ADMIN.ADMINS} element={<SuperAdminAdminsPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.USERS} element={<UsersPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TRAFFIC_CATEGORIES} element={<TrafficCategories />} />
                    <Route path={ROUTES.SUPER_ADMIN.COUNTRIES} element={<Countries />} />
                    <Route path={ROUTES.SUPER_ADMIN.PROVINCES} element={<Provinces />} />
                    <Route path={ROUTES.SUPER_ADMIN.USER_DETAIL} element={<SuperAdminUserDetail />} />
                    <Route path={ROUTES.SUPER_ADMIN.QUESTION_BANKS} element={<QuestionBanksPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.QUESTION_BANK_DETAIL} element={<QuestionBankDetailPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.QUESTION_BANK_ADD_QUESTIONS} element={<AddQuestionsPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.QUESTION_BANK_EDIT_QUESTION} element={<EditQuestionPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TEST_CATEGORIES} element={<TestCategoriesPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TRAFFIC_SIGNS} element={<TrafficSignsPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TRAFFIC_SIGNS_CREATE} element={<CreateEditTrafficSignPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TRAFFIC_SIGNS_EDIT} element={<CreateEditTrafficSignPage />} />

                    {/* ====== ADDITIONAL SUPER ADMIN ROUTES FROM FIRST FILE ====== */}
                    <Route path={ROUTES.SUPER_ADMIN.USER_MATERIALS} element={<UserMaterial />} />
                    <Route path={ROUTES.SUPER_ADMIN.QUESTION_BANKS} element={<QuestionBanksPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.QUESTION_BANK_DETAIL} element={<QuestionBankDetailPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.QUESTION_BANK_ADD_QUESTIONS} element={<AddQuestionsPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.QUESTION_BANK_EDIT_QUESTION} element={<EditQuestionPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TEST_CATEGORIES} element={<TestCategoriesPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TRAFFIC_SIGNS} element={<TrafficSignsPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TRAFFIC_SIGNS_CREATE} element={<CreateEditTrafficSignPage />} />
                    <Route path={ROUTES.SUPER_ADMIN.TRAFFIC_SIGNS_EDIT} element={<CreateEditTrafficSignPage />} />
                </Route>

                {/* ====== ERROR ROUTES (from second file) ====== */}
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}