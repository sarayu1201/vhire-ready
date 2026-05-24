import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

export default function Signup() {
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const { setPendingAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (role === 'admin') {
        const { data } = await axios.post(`${API_URL}/api/admin/signup`, { ...form, inviteCode });
        localStorage.setItem('vhire_admin_token', data.token);
        navigate('/admin');
      } else {
        const { data } = await axios.post(`${API_URL}/api/auth/signup`, form);
        setPendingAuth(data);   // store token temporarily, do NOT login yet
        navigate('/terms');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
      <h2>Sign Up</h2>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input type="radio" value="user" checked={role === 'user'} onChange={() => setRole('user')} /> User
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input type="radio" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} /> Admin
        </label>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        {role === 'admin' && (
          <input
            type="text"
            placeholder="Admin Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
          />
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: 10 }}>Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
