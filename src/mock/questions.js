export const mockQuestions = [
    {
        id: '1',
        categoryId: '1',
        stateId: '1',
        question: 'What does a red traffic light mean?',
        options: ['Stop', 'Go', 'Slow down', 'Yield'],
        correctAnswer: 0,
        explanation: 'A red traffic light means you must come to a complete stop.',
        difficulty: 'easy',
        createdAt: '2024-01-15T10:30:00Z',
    },
    {
        id: '2',
        categoryId: '2',
        stateId: '1',
        question: 'When can you overtake on the right?',
        options: [
            'Never',
            'When the vehicle ahead is turning left',
            'On highways only',
            'During nighttime',
        ],
        correctAnswer: 1,
        explanation: 'You can overtake on the right when the vehicle ahead is making a left turn.',
        difficulty: 'medium',
        createdAt: '2024-01-16T10:30:00Z',
    },
    // Add more questions as needed
];