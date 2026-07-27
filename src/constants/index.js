// export const APP_NAME = "ClearDrive";
// export const APP_DESCRIPTION =
//   "Ace your US driving license test with practice questions and mock tests";

// export const ROLES = {
//   USER: "user",
//   ADMIN: "admin",
//   SUPER_ADMIN: "super_admin",
// };

// export const ROUTES = {
//   HOME: "/",
//   LOGIN: "/login",
//   SIGNUP: "/signup",
//   DASHBOARD: "/dashboard",
//   PRACTICE: "/practice",
//   PRACTICE_TEST: "/practice/test",
//   PROFILE: "/profile",
//   RESULTS: "/results",
//   RESULTS_DETAIL: "/results/:id",

//   ADMIN: {
//     DASHBOARD: "/admin/dashboard",
//     USERS: "/admin/users",
//     QUESTIONS: "/admin/questions",
//     CATEGORIES: "/admin/categories",
//     STATES: "/admin/states",
//     REPORTS: "/admin/reports",
//     SETTINGS: "/admin/settings",
//     PROFILE: "/admin/profile",
//     QUESTION_BANKS: "/admin/question-banks",
//     QUESTION_BANK_DETAIL: "/admin/question-banks/:id",
//     QUESTION_BANK_ADD_QUESTIONS: "/admin/question-banks/:id/questions/add",
//     QUESTION_BANK_EDIT_QUESTION:"/admin/question-banks/:id/questions/:questionId/edit",
//     TEST_CATEGORIES: "/admin/test-categories",
//     TRAFFIC_SIGNS: '/admin/traffic-signs',
//     TRAFFIC_SIGNS_CREATE: '/admin/traffic-signs/create',
//     TRAFFIC_SIGNS_EDIT: '/admin/traffic-signs/:id/edit',
//     TESTS: "/admin/tests",
//     TESTS_CREATE: "/admin/tests/create",
//     TESTS_EDIT: "/admin/tests/:id/edit",
//     PRACTICE_TESTS: "/admin/practice-tests",
//     PRACTICE_TESTS_CREATE: "/admin/practice-tests/create",
//     PRACTICE_TESTS_EDIT: "/admin/practice-tests/:id/edit",
//     TEST_DETAIL: "/admin/tests/:id",
//     PROVINCES: '/admin/provinces',
//     TRAFFIC_SIGNS: '/admin/traffic-signs',
//   },

//   SUPER_ADMIN: {
//     DASHBOARD: "/super-admin/dashboard",
//     ADMINS: "/super-admin/admins",
//     USERS: "/super-admin/users",
//     TRAFFIC_CATEGORIES: "/super-admin/traffic-categories",
//     COUNTRIES: "/super-admin/countries",
//     PROVINCES: "/super-admin/provinces",
//     USER_DETAIL: "/super-admin/users/:id",
//     QUESTION_BANKS: "/super-admin/question-banks",
//     QUESTION_BANK_DETAIL: "/super-admin/question-banks/:id",
//     QUESTION_BANK_ADD_QUESTIONS: "/super-admin/question-banks/:id/questions/add",
//     QUESTION_BANK_EDIT_QUESTION:"/super-admin/question-banks/:id/questions/:questionId/edit",
//     TEST_CATEGORIES: "/super-admin/test-categories",
//     TRAFFIC_SIGNS: "/super-admin/traffic-signs",
//     TRAFFIC_SIGNS_CREATE: "/super-admin/traffic-signs/create",
//     TRAFFIC_SIGNS_EDIT: "/super-admin/traffic-signs/:id/edit",
//   },
// };

// export const QUESTION_TYPES = {
//   MULTIPLE_CHOICE: "multiple_choice",
//   TRUE_FALSE: "true_false",
// };

// export const TEST_STATUS = {
//   IN_PROGRESS: "in_progress",
//   COMPLETED: "completed",
//   ABANDONED: "abandoned",
// };



// export const APP_NAME = 'ClearDrive';
// export const APP_DESCRIPTION = 'Ace your US driving license test with practice questions and mock tests';


// export const ROLES = {
//     USER: 'user',
//     ADMIN: 'admin',
//     SUPER_ADMIN: 'super_admin',
// };

// export const ROUTES = {
//     HOME: '/',
//     LOGIN: '/login',
//     SIGNUP: '/signup',
//     DASHBOARD: '/dashboard',
//     PRACTICE: '/practice',
//     PRACTICE_TEST: '/practice/test',
//     PROFILE: '/profile',
//     RESULTS: '/results',
//     RESULTS_DETAIL: '/results/:id',

//     ADMIN: {
//         DASHBOARD: '/admin/dashboard',
//         USERS: '/admin/users',
//         QUESTIONS: '/admin/questions',
//         CATEGORIES: '/admin/categories',
//         STATES: '/admin/states',
//         REPORTS: '/admin/reports',
//         SETTINGS: '/admin/settings',
//         PROFILE: '/admin/profile',
//         QUESTION_BANKS: '/admin/question-banks',
//         QUESTION_BANK_DETAIL: '/admin/question-banks/:id',
//         QUESTION_BANK_ADD_QUESTIONS: '/admin/question-banks/:id/questions/add',
//         QUESTION_BANK_EDIT_QUESTION: '/admin/question-banks/:id/questions/:questionId/edit',
//         TEST_CATEGORIES: '/admin/test-categories',
//         TRAFFIC_SIGNS: '/admin/traffic-signs',
//         TRAFFIC_SIGNS_CREATE: '/admin/traffic-signs/create',
//         TRAFFIC_SIGNS_EDIT: '/admin/traffic-signs/:id/edit',
//         TESTS: '/admin/tests',
//         TESTS_CREATE: '/admin/tests/create',
//         TESTS_EDIT: '/admin/tests/:id/edit',
//         PRACTICE_TESTS: '/admin/practice-tests',
//         PRACTICE_TESTS_CREATE: '/admin/practice-tests/create',
//         PRACTICE_TESTS_EDIT: '/admin/practice-tests/:id/edit',
//         TEST_DETAIL: '/admin/tests/:id',

//     },

//     SUPER_ADMIN: {
//         DASHBOARD: '/super-admin/dashboard',
//         ADMINS: '/super-admin/admins',
//         USERS: '/super-admin/users',
//         TRAFFIC_CATEGORIES: '/super-admin/traffic-categories',
//         COUNTRIES: '/super-admin/countries',
//         PROVINCES: '/super-admin/provinces',
//         USER_DETAIL: '/super-admin/users/:id',
//         QUESTION_BANKS: '/super-admin/question-banks',
//         QUESTION_BANK_DETAIL: '/super-admin/question-banks/:id',
//         QUESTION_BANK_ADD_QUESTIONS: '/super-admin/question-banks/:id/questions/add',
//         QUESTION_BANK_EDIT_QUESTION: '/super-admin/question-banks/:id/questions/:questionId/edit',
//         TEST_CATEGORIES: '/super-admin/test-categories',
//         TRAFFIC_SIGNS: '/super-admin/traffic-signs',
//         TRAFFIC_SIGNS_CREATE: '/super-admin/traffic-signs/create',
//         TRAFFIC_SIGNS_EDIT: '/super-admin/traffic-signs/:id/edit',
//     },
// };

// export const QUESTION_TYPES = {
//     MULTIPLE_CHOICE: 'multiple_choice',
//     TRUE_FALSE: 'true_false',
// };

// export const TEST_STATUS = {
//     IN_PROGRESS: 'in_progress',
//     COMPLETED: 'completed',
//     ABANDONED: 'abandoned',
// };


// constants.js

export const APP_NAME = 'ClearDrive';
export const APP_DESCRIPTION = 'Ace your US driving license test with practice questions and mock tests';

export const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
};

export const ROUTES = {
    // ====== PUBLIC ROUTES ======
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    
    // ====== USER ROUTES (Top-level) ======
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    RESULTS: '/results',
    RESULTS_DETAIL: '/results/:id',
    
    // Regular Tests
    TESTS: '/tests',
    TEST_START: '/tests/:testId',
    
    // Practice Tests
    PRACTICE_TESTS: '/practice-tests',
    PRACTICE_TEST_START: '/practice-tests/:testId',
    
    // Other
    MATERIALS: '/materials',
    TRAFFIC_SIGNS: '/traffic-signs',
    
    // Old routes (backward compatibility)
    PRACTICE: '/practice',
    PRACTICE_TEST: '/practice/test',

    // ====== USER NESTED ROUTES ======
    USER: {
        DASHBOARD: '/dashboard',
        TRAFFIC_SIGNS: '/traffic-signs',
        TESTS: '/tests',
        TEST_START: '/tests/:testId',
        PRACTICE: '/practice',
        PRACTICE_TESTS: '/practice-tests',
        PRACTICE_TEST_START: '/practice-tests/:testId',
        MATERIALS: '/materials',
        PROFILE: '/profile',
        RESULTS: '/results',
        RESULTS_DETAIL: '/results/:id',
    },

    // ====== ADMIN ROUTES ======
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        USER_MATERIALS: '/admin/user-materials',
        QUESTIONS: '/admin/questions',
        CATEGORIES: '/admin/categories',
        STATES: '/admin/states',
        REPORTS: '/admin/reports',
        SETTINGS: '/admin/settings',
        PROFILE: '/admin/profile',
        QUESTION_BANKS: '/admin/question-banks',
        QUESTION_BANK_DETAIL: '/admin/question-banks/:id',
        QUESTION_BANK_ADD_QUESTIONS: '/admin/question-banks/:id/questions/add',
        QUESTION_BANK_EDIT_QUESTION: '/admin/question-banks/:id/questions/:questionId/edit',
        TEST_CATEGORIES: '/admin/test-categories',
        TRAFFIC_SIGNS: '/admin/traffic-signs',
        TRAFFIC_SIGNS_CREATE: '/admin/traffic-signs/create',
        TRAFFIC_SIGNS_EDIT: '/admin/traffic-signs/:id/edit',
        TESTS: '/admin/tests',
        TESTS_CREATE: '/admin/tests/create',
        TESTS_EDIT: '/admin/tests/:id/edit',
        PRACTICE_TESTS: '/admin/practice-tests',
        PRACTICE_TESTS_CREATE: '/admin/practice-tests/create',
        PRACTICE_TESTS_EDIT: '/admin/practice-tests/:id/edit',
        TEST_DETAIL: '/admin/tests/:id',
    },

    // ====== SUPER ADMIN ROUTES ======
    SUPER_ADMIN: {
        DASHBOARD: '/super-admin/dashboard',
        ADMINS: '/super-admin/admins',
        USERS: '/super-admin/users',
        USER_MATERIALS: '/super-admin/user-materials',
        TRAFFIC_CATEGORIES: '/super-admin/traffic-categories',
        COUNTRIES: '/super-admin/countries',
        PROVINCES: '/super-admin/provinces',
        USER_DETAIL: '/super-admin/users/:id',
        PROFILE: '/super-admin/profile',  // ✅ ADDED
        QUESTION_BANKS: '/super-admin/question-banks',
        QUESTION_BANK_DETAIL: '/super-admin/question-banks/:id',
        QUESTION_BANK_ADD_QUESTIONS: '/super-admin/question-banks/:id/questions/add',
        QUESTION_BANK_EDIT_QUESTION: '/super-admin/question-banks/:id/questions/:questionId/edit',
        TEST_CATEGORIES: '/super-admin/test-categories',
        TRAFFIC_SIGNS: '/super-admin/traffic-signs',
        TRAFFIC_SIGNS_CREATE: '/super-admin/traffic-signs/create',
        TRAFFIC_SIGNS_EDIT: '/super-admin/traffic-signs/:id/edit',
    },
};

export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
};

export const TEST_STATUS = {
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ABANDONED: 'abandoned',
};