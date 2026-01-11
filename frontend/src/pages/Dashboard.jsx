import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [amount, setAmount] = useState(15);
    const [duration, setDuration] = useState(30);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/quiz/history');
                setHistory(res.data.quizzes);
            } catch (err) {
                console.error('Failed to fetch history', err);
            }
        };
        fetchHistory();
    }, []);

    const startQuiz = async () => {
        try {
            const res = await api.post('/quiz/start', { amount, duration });
            navigate(`/quiz/${res.data.sessionId}`, { state: { quizData: res.data } });
        } catch (err) {
            console.error('Failed to start quiz', err);
            alert('Failed to start quiz. Please try again.');
        }
    };

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <header className="quiz-header">
                <div>
                    <h2>Hello, {user.username}</h2>
                    <p>Ready to test your knowledge?</p>
                </div>
                <button className="btn danger" onClick={logout}>Logout</button>
            </header>

            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div className="question-panel" style={{ width: '100%', textAlign: 'center', minHeight: 'auto' }}>
                    <h3>Start a New Quiz</h3>

                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Number of Questions</label>
                            <select
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    color: 'white',
                                    border: '1px solid var(--border)',
                                    minWidth: '150px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={15}>15 Questions</option>
                                <option value={30}>30 Questions</option>
                                <option value={45}>45 Questions</option>
                            </select>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Duration</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    color: 'white',
                                    border: '1px solid var(--border)',
                                    minWidth: '150px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={5}>5 Minutes</option>
                                <option value={10}>10 Minutes</option>
                                <option value={15}>15 Minutes</option>
                                <option value={30}>30 Minutes</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn" onClick={startQuiz} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>Start Quiz</button>
                </div>

                {history.length > 0 && (
                    <div className="question-panel" style={{ width: '100%', minHeight: 'auto' }}>
                        <h3>Your History</h3>
                        <div className="report-list">
                            {history.map((h) => (
                                <div key={h.sessionId} className="report-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div className="meta">{new Date(h.date).toLocaleDateString()} • {new Date(h.date).toLocaleTimeString()}</div>
                                        <h4>Score: {h.score} / {h.totalQuestions}</h4>
                                    </div>
                                    <div className="meta">{Math.floor(h.timeTaken / 60)}m {h.timeTaken % 60}s</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
