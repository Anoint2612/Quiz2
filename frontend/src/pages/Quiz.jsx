import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

export default function Quiz() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [visited, setVisited] = useState(new Set([0]));
    const [timer, setTimer] = useState(30 * 60);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    useEffect(() => {
        const initQuiz = async () => {
            if (location.state?.quizData) {
                setQuestions(location.state.quizData.questions);
                setTimer(location.state.quizData.duration);
                setLoading(false);
            } else {
                // Fetch session if page reloaded
                try {
                    const res = await api.get(`/quiz/session/${sessionId}`);
                    setQuestions(res.data.questions);
                    // Calculate remaining time? For now reset to duration or implement server-side time tracking
                    // The backend stores startTime, so we could calculate remaining time
                    // But for simplicity let's use the duration sent back
                    setTimer(res.data.duration); // This might reset timer on reload if backend doesn't adjust
                    // Ideally backend should send remaining time
                    setLoading(false);
                } catch (err) {
                    console.error(err);
                    navigate('/');
                }
            }
        };
        initQuiz();

        return () => clearInterval(timerRef.current);
    }, [sessionId, location.state, navigate]);

    useEffect(() => {
        if (!loading && questions.length > 0) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        submitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [loading, questions]);

    const handleAnswer = async (option) => {
        setAnswers({ ...answers, [currentIndex]: option });
        // Optimistic update
        try {
            await api.post('/quiz/answer', {
                sessionId,
                questionId: questions[currentIndex].id,
                answer: option
            });
        } catch (err) {
            console.error('Failed to save answer', err);
        }
    };

    const handleVisit = async (index) => {
        setCurrentIndex(index);
        setVisited(new Set([...visited, index]));
        try {
            await api.post('/quiz/visit', {
                sessionId,
                questionId: questions[index].id
            });
        } catch (err) {
            console.error('Failed to mark visit', err);
        }
    };

    const submitQuiz = async () => {
        clearInterval(timerRef.current);
        try {
            await api.post('/quiz/submit', { sessionId });
            navigate(`/report/${sessionId}`);
        } catch (err) {
            console.error('Failed to submit', err);
            // Fallback or retry?
            navigate(`/report/${sessionId}`); // Even if it fails, maybe it was already submitted?
        }
    };

    if (loading) return <div className="screen active">Loading...</div>;

    const currentQuestion = questions[currentIndex];
    const formatTime = (s) => {
        const mm = Math.floor(s / 60).toString().padStart(2, '0');
        const ss = (s % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <header className="quiz-header">
                <div className="timer">{formatTime(timer)}</div>
                <div className="progress">Question <span id="current-index">{currentIndex + 1}</span> / {questions.length}</div>
            </header>

            <div className="container">
                <aside className="overview">
                    <h3>Overview</h3>
                    <div className="overview-list">
                        {questions.map((q, i) => (
                            <div
                                key={q.id}
                                className={`overview-item ${visited.has(i) ? 'visited' : ''} ${answers[i] ? 'attempted' : ''}`}
                                onClick={() => handleVisit(i)}
                                style={i === currentIndex ? { borderColor: 'white', borderWidth: '2px' } : {}}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <button className="btn danger" onClick={() => { if (confirm('Submit quiz?')) submitQuiz() }}>Submit Quiz</button>
                </aside>

                <section className="question-panel">
                    <div className="question show">
                        <div className="meta">{currentQuestion.category} • {currentQuestion.difficulty}</div>
                        <h3>{currentIndex + 1}. {currentQuestion.question}</h3>
                        <div className="options">
                            {currentQuestion.options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`option ${answers[currentIndex] === opt ? 'selected' : ''}`}
                                    onClick={() => handleAnswer(opt)}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>

                    <nav className="nav-controls">
                        <button
                            className="btn"
                            onClick={() => handleVisit(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
                        >
                            Previous
                        </button>
                        <button
                            className="btn"
                            onClick={() => handleVisit(currentIndex + 1)}
                            disabled={currentIndex === questions.length - 1}
                            style={{ opacity: currentIndex === questions.length - 1 ? 0.5 : 1 }}
                        >
                            Next
                        </button>
                    </nav>
                </section>
            </div>
        </div>
    );
}
