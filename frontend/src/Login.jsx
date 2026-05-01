import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // FastAPI OAuth2 standard: data form-encoded hota hai
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/login', formData);
            localStorage.setItem('token', response.data.access_token);
            
            // User ki details nikal rahe hain taaki role pata chale
            const userRes = await api.get('/users/me');
            localStorage.setItem('role', userRes.data.role);
            
            navigate('/dashboard');
        } catch (error) {
            alert('Login fail! Email ya Password check karo.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Team Manager Login</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Naya account banana hai? <span style={{ color: '#c084fc', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Signup karo</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
