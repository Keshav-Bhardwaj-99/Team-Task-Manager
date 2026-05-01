import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Member');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/signup', { name, email, password, role });
            alert('Account ban gaya! Ab login karo bhai.');
            navigate('/');
        } catch (error) {
            alert('Signup fail ho gaya! Email shayad pehle se hai.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                <form onSubmit={handleSignup}>
                    <input type="text" placeholder="Apna Naam" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="Admin">Join as Project Admin</option>
                        <option value="Member">Join as Team Member</option>
                    </select>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Sign Up</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Account hai? <span style={{ color: '#c084fc', cursor: 'pointer' }} onClick={() => navigate('/')}>Login karo</span>
                </p>
            </div>
        </div>
    );
};

export default Signup;
