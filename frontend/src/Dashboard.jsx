import React, { useEffect, useState } from 'react';
import api from './api';
import { Plus, Clock, LogOut, Shield, Users, Briefcase, MessageCircle, Send, User, CheckCircle2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    // Saara data yahan store hoga
    const [me, setMe] = useState(null);
    const [stats, setStats] = useState({});
    const [myTasks, setMyTasks] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [commentText, setCommentText] = useState({});
    const [selectedMember, setSelectedMember] = useState(null);

    // Forms ke liye states
    const [projectName, setProjectName] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [selectedProject, setSelectedProject] = useState('');

    const navigate = useNavigate();

    // Database se sara data fetch karne wala function
    const fetchData = async () => {
        try {
            const [userRes, s, t, p, u] = await Promise.all([
                api.get('/users/me'),
                api.get('/dashboard-stats'),
                api.get('/my-tasks'),
                api.get('/projects'),
                api.get('/users')
            ]);
            setMe(userRes.data);
            setStats(s.data);
            setMyTasks(t.data);
            setAllProjects(p.data);
            setUsers(u.data);
        } catch (err) { navigate('/'); }
    };

    useEffect(() => { fetchData(); }, []);

    const updateStatus = async (id, statusType, newValue) => {
        try {
            const body = statusType === 'admin' ? { admin_status: newValue } : { status: newValue };
            await api.patch(`/tasks/${id}`, body);
            fetchData();
        } catch (err) { 
            console.error(err);
            alert('Update fail! Check if you have permissions.'); 
        }
    };

    const handleAddComment = async (taskId) => {
        if (!commentText[taskId]) return;
        try {
            await api.post(`/tasks/${taskId}/comments`, { content: commentText[taskId] });
            setCommentText({ ...commentText, [taskId]: '' });
            fetchData();
        } catch (err) { alert('Comment failed!'); }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', { name: projectName, description: "New" });
            setProjectName(''); fetchData();
            alert('Naya Project ban gaya!');
        } catch (err) { alert('Denied!'); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!selectedMember) { alert("Pehle member select karo!"); return; }
        try {
            await api.post('/tasks', { title: taskTitle, description: "Do it", project_id: selectedProject, assigned_to: selectedMember.id });
            setTaskTitle(''); fetchData();
            alert('Task assigned!');
        } catch (err) { alert('Error!'); }
    };

    if (!me) return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>;

    const membersOnly = users.filter(u => u.role === 'Member');
    const selectedMemberTasks = myTasks.filter(t => t.assigned_to === selectedMember?.id);

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', lineHeight: '1.2' }}>Team Manager Pro</h1>
                    <p style={{ color: '#94a3b8' }}>{me.name} • <span style={{ color: '#c084fc' }}>{me.role}</span></p>
                </div>
                <button className="btn-primary" onClick={() => { localStorage.removeItem('token'); navigate('/'); }} style={{ background: '#ef4444' }}><LogOut size={18} /> Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card"><h3>Projects</h3><p style={{ fontSize: '1.5rem' }}>{stats.total_projects}</p></div>
                <div className="glass-card"><h3>Total Tasks</h3><p style={{ fontSize: '1.5rem' }}>{stats.total_tasks}</p></div>
                <div className="glass-card"><h3>Final Done</h3><p style={{ fontSize: '1.5rem', color: '#4ade80' }}>{stats.completed_tasks}</p></div>
                <div className="glass-card"><h3>Pending/Review</h3><p style={{ fontSize: '1.5rem', color: '#f87171' }}>{stats.pending_tasks}</p></div>
            </div>

            {me.role === 'Admin' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="glass-card">
                            <h2 style={{ marginBottom: '1.2rem', fontSize: '1.1rem' }}><Users size={18}/> Team Members</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {membersOnly.map(u => (
                                    <div key={u.id} onClick={() => setSelectedMember(u)} style={{ padding: '12px', cursor: 'pointer', background: selectedMember?.id === u.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{u.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card">
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}><Briefcase size={18}/> Management</h2>
                            <form onSubmit={handleCreateProject} style={{ marginBottom: '1rem' }}>
                                <input type="text" placeholder="Project Name" className="input-field" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>New Project</button>
                            </form>
                            <form onSubmit={handleCreateTask}>
                                <input type="text" placeholder="Task Title" className="input-field" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
                                <select className="input-field" onChange={(e) => setSelectedProject(e.target.value)} required>
                                    <option value="">Select Project</option>
                                    {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Assign to {selectedMember?.name || "Member"}</button>
                            </form>
                        </div>
                    </div>

                    <div className="glass-card">
                        {!selectedMember ? (
                            <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
                                <Search size={40} style={{ marginBottom: '1rem' }}/>
                                <h2>Select member to verify work</h2>
                            </div>
                        ) : (
                            <div>
                                <h2 style={{ marginBottom: '2rem' }}>Verifying: {selectedMember.name}</h2>
                                {selectedMemberTasks.map(task => (
                                    <div key={task.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '15px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <div>
                                                <h3>{task.title}</h3>
                                                <p style={{ color: '#818cf8' }}>Project: {task.project_name}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '2rem' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>MEMBER SAYS</p>
                                                    <p style={{ fontWeight: 'bold', color: task.status === 'Completed' ? '#4ade80' : 'white' }}>{task.status}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#c084fc' }}>YOUR VERIFICATION</p>
                                                    <select value={task.admin_status} onChange={(e) => updateStatus(task.id, 'admin', e.target.value)} style={{ background: '#1e293b', color: 'white', border: '1px solid #c084fc', borderRadius: '8px', padding: '5px' }}>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Under Review">Under Review</option>
                                                        <option value="Completed">Final Completed</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem' }}>
                                            <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '1rem' }}>
                                                {task.comments.map(c => (
                                                    <p key={c.id} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                                        <span style={{ color: c.author_name === me.name ? '#4ade80' : '#818cf8', fontWeight: 'bold' }}>{c.author_name}:</span> {c.content}
                                                    </p>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input type="text" placeholder="Send instructions..." className="input-field" style={{ marginBottom: 0 }} value={commentText[task.id] || ''} onChange={(e) => setCommentText({ ...commentText, [task.id]: e.target.value })} />
                                                <button onClick={() => handleAddComment(task.id)} className="btn-primary" style={{ padding: '0.8rem' }}><Send size={16}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="glass-card">
                    <h2 style={{ marginBottom: '2rem' }}><Briefcase size={22}/> My Projects & Tasks</h2>
                    {myTasks.map(task => (
                        <div key={task.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3>{task.title}</h3>
                                    <p style={{ color: '#818cf8' }}>Project: {task.project_name}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Admin: {task.owner_name}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>YOUR STATUS</p>
                                        <select value={task.status} onChange={(e) => updateStatus(task.id, 'member', e.target.value)} style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px', padding: '5px' }}>
                                            <option value="Pending">Pending</option>
                                            <option value="Doing">Working</option>
                                            <option value="Completed">Work Done</option>
                                        </select>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#c084fc' }}>ADMIN REVIEW</p>
                                        <p style={{ fontWeight: 'bold', color: task.admin_status === 'Completed' ? '#4ade80' : '#f87171' }}>{task.admin_status}</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem' }}>
                                <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '1rem' }}>
                                    {task.comments.map(c => (
                                        <p key={c.id} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span style={{ color: c.author_name === me.name ? '#4ade80' : '#818cf8', fontWeight: 'bold' }}>{c.author_name}:</span> {c.content}
                                        </p>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" placeholder="Update admin..." className="input-field" style={{ marginBottom: 0 }} value={commentText[task.id] || ''} onChange={(e) => setCommentText({ ...commentText, [task.id]: e.target.value })} />
                                    <button onClick={() => handleAddComment(task.id)} className="btn-primary" style={{ padding: '0.8rem' }}><Send size={16}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
