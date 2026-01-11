import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    // Verify token and get user data
                    // For now, we decode manually or just trust existence + API verification
                    // Let's assume we store user in localstorage too for quick load, or fetch it
                    // Ideally fetch from /auth/user
                    const res = await api.get('/auth/user');
                    setUser(res.data);
                } catch (err) {
                    sessionStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        sessionStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const signup = async (username, email, password) => {
        const res = await api.post('/auth/signup', { username, email, password });
        sessionStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
