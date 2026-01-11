const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// HTML entity decoder
const decodeHTML = (html) => {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'");
};

// @route   POST /api/quiz/start
// @desc    Start a new quiz session
// @access  Private
// @route   POST /api/quiz/start
// @desc    Start a new quiz session
// @access  Private
router.post('/start', protect, async (req, res) => {
    try {
        let { amount, duration } = req.body;

        // Validate and set defaults
        const validAmounts = [15, 30, 45];
        const validDurations = [5, 10, 15, 30];

        amount = validAmounts.includes(Number(amount)) ? Number(amount) : 15;
        duration = validDurations.includes(Number(duration)) ? Number(duration) : 30;

        // Fetch questions from OpenTDB API
        const resp = await axios.get(`https://opentdb.com/api.php?amount=${amount}`);
        const responseData = resp.data;

        if (responseData.response_code !== 0) {
            return res.status(500).json({ error: 'Failed to fetch questions from API' });
        }

        let questions = responseData.results.map((q, index) => {
            // Combine correct and incorrect answers
            const allAnswers = [q.correct_answer, ...q.incorrect_answers];

            // Shuffle answers
            const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

            return {
                id: index + 1,
                question: decodeHTML(q.question),
                options: shuffledAnswers.map(decodeHTML),
                correctAnswer: decodeHTML(q.correct_answer),
                type: q.type,
                difficulty: q.difficulty,
                category: decodeHTML(q.category),
            };
        });

        // Ensure questions is an array with proper shapes
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(500).json({ error: 'No questions returned from API' });
        }

        // Create a new quiz session
        const sessionId = uuidv4();
        const quiz = await Quiz.create({
            userId: req.user._id,
            email: req.user.email,
            sessionId,
            questions,
            answers: {},
            visitedQuestions: [1], // Mark first question as visited
            startTime: new Date(),
        });

        // Return questions without correct answers
        const questionsForClient = questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            type: q.type,
            difficulty: q.difficulty,
            category: q.category,
        }));

        res.json({
            sessionId,
            questions: questionsForClient,
            duration: duration * 60, // Convert minutes to seconds
        });
    } catch (error) {
        console.error('Error starting quiz:', error && error.stack ? error.stack : error);
        res.status(500).json({ error: 'Failed to start quiz', details: error.message || error });
    }
});

// @route   POST /api/quiz/answer
// @desc    Save answer for a question
// @access  Private
router.post('/answer', protect, async (req, res) => {
    try {
        const { sessionId, questionId, answer } = req.body;

        if (!sessionId || !questionId) {
            return res.status(400).json({ error: 'Session ID and Question ID are required' });
        }

        const quiz = await Quiz.findOne({ sessionId, userId: req.user._id });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz session not found' });
        }

        if (quiz.submitted) {
            return res.status(400).json({ error: 'Quiz already submitted' });
        }

        // Save the answer
        quiz.answers.set(questionId.toString(), answer);
        await quiz.save();

        res.json({ success: true, message: 'Answer saved' });
    } catch (error) {
        console.error('Error saving answer:', error);
        res.status(500).json({ error: 'Failed to save answer' });
    }
});

// @route   POST /api/quiz/visit
// @desc    Mark question as visited
// @access  Private
router.post('/visit', protect, async (req, res) => {
    try {
        const { sessionId, questionId } = req.body;

        if (!sessionId || !questionId) {
            return res.status(400).json({ error: 'Session ID and Question ID are required' });
        }

        const quiz = await Quiz.findOne({ sessionId, userId: req.user._id });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz session not found' });
        }

        if (!quiz.visitedQuestions.includes(questionId)) {
            quiz.visitedQuestions.push(questionId);
            await quiz.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking visit:', error);
        res.status(500).json({ error: 'Failed to mark visit' });
    }
});

// @route   GET /api/quiz/status/:sessionId
// @desc    Get session status
// @access  Private
router.get('/status/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const quiz = await Quiz.findOne({ sessionId, userId: req.user._id });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz session not found' });
        }

        const answeredQuestions = Array.from(quiz.answers.keys()).map(Number);

        res.json({
            answeredQuestions,
            visitedQuestions: quiz.visitedQuestions,
            totalQuestions: quiz.questions.length,
            submitted: quiz.submitted,
        });
    } catch (error) {
        console.error('Error getting status:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

// @route   GET /api/quiz/session/:sessionId
// @desc    Get stored questions for a session (without correct answers) so client can resume
// @access  Private
router.get('/session/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const quiz = await Quiz.findOne({ sessionId, userId: req.user._id });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz session not found' });
        }

        // Return questions but exclude correctAnswer
        const questionsForClient = quiz.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            type: q.type,
            difficulty: q.difficulty,
            category: q.category,
        }));

        res.json({ sessionId: quiz.sessionId, questions: questionsForClient, duration: 30 * 60 });
    } catch (error) {
        console.error('Error getting session questions:', error);
        res.status(500).json({ error: 'Failed to get session questions' });
    }
});

// @route   POST /api/quiz/submit
// @desc    Submit quiz
// @access  Private
router.post('/submit', protect, async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const quiz = await Quiz.findOne({ sessionId, userId: req.user._id });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz session not found' });
        }

        if (quiz.submitted) {
            return res.status(400).json({ error: 'Quiz already submitted' });
        }

        // Calculate score
        let score = 0;
        const results = quiz.questions.map((q) => {
            const userAnswer = quiz.answers.get(q.id.toString()) || null;
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) score++;

            return {
                questionId: q.id,
                question: q.question,
                options: q.options,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                category: q.category,
                difficulty: q.difficulty,
            };
        });

        // Mark quiz as submitted
        quiz.endTime = new Date();
        quiz.score = score;
        quiz.submitted = true;
        quiz.timeTaken = Math.floor((quiz.endTime - quiz.startTime) / 1000); // in seconds
        await quiz.save();

        res.json({
            score,
            totalQuestions: quiz.questions.length,
            results,
            timeTaken: quiz.timeTaken,
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// @route   GET /api/quiz/history
// @desc    Get all completed quizzes for current user
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            submitted: true,
        })
            .select('sessionId email score totalQuestions endTime timeTaken')
            .sort({ endTime: -1 });

        const history = quizzes.map((quiz) => ({
            sessionId: quiz.sessionId,
            email: quiz.email,
            score: quiz.score,
            totalQuestions: quiz.totalQuestions,
            date: quiz.endTime,
            timeTaken: quiz.timeTaken,
        }));

        res.json({ quizzes: history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// @route   GET /api/quiz/results/:sessionId
// @desc    Get detailed results for a specific quiz
// @access  Private
router.get('/results/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const quiz = await Quiz.findOne({ sessionId, userId: req.user._id });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz session not found' });
        }

        if (!quiz.submitted) {
            return res.status(400).json({ error: 'Quiz not yet submitted' });
        }

        const results = quiz.questions.map((q) => {
            const userAnswer = quiz.answers.get(q.id.toString()) || null;
            const isCorrect = userAnswer === q.correctAnswer;

            return {
                questionId: q.id,
                question: q.question,
                options: q.options,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                category: q.category,
                difficulty: q.difficulty,
            };
        });

        const user = await User.findById(req.user._id);

        res.json({
            username: user ? user.username : 'Unknown',
            email: quiz.email,
            score: quiz.score,
            totalQuestions: quiz.questions.length,
            results,
            startTime: quiz.startTime,
            endTime: quiz.endTime,
            timeTaken: quiz.timeTaken,
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

module.exports = router;
