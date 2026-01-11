import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Report() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get(`/quiz/results/${sessionId}`);
                setResults(res.data);
            } catch (err) {
                console.error('Failed to fetch results', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [sessionId]);

    if (loading) return <div className="screen active">Loading report...</div>;
    if (!results) return <div className="screen active">Failed to load results.</div>;

    const formatTime = (s) => {
        const mm = Math.floor(s / 60);
        const ss = s % 60;
        return `${mm}m ${ss}s`;
    };

    return (
        <div className="screen active" style={{ display: 'block' }}>
            <div id="report-screen">
                <h2>Quiz Report</h2>
                <div className="summary">
                    <p className="meta">
                        Name: {results.username} • Score: {results.score} / {results.totalQuestions} • Time: {formatTime(results.timeTaken)}
                    </p>
                </div>
                <div className="report-list">
                    {results.results.map((r, i) => (
                        <div key={i} className="report-item fade-in">
                            <div className="meta">{r.category} • {r.difficulty} • {r.isCorrect ? '✅ Correct' : '❌ Wrong'}</div>
                            <h4>{r.question}</h4>
                            <div><strong>Your answer:</strong> {r.userAnswer || <em>Not answered</em>}</div>
                            <div><strong>Correct answer:</strong> {r.correctAnswer}</div>
                        </div>
                    ))}
                </div>
                <div className="report-actions">
                    <button className="btn" onClick={() => navigate('/')}>Back to Dashboard</button>
                </div>
            </div>
        </div>
    );
}
