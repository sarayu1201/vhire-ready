import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import API_URL from '../config';

const API = `${API_URL}/api/user`;

const S = {
  page: { minHeight: '100vh', background: '#f4f7f4', padding: '40px 16px' },
  wrap: { maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 },
  card: {
    background: '#fff', borderRadius: 12, padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  dangerCard: {
    background: '#fff', borderRadius: 12, padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f5c2c2',
  },
  cardTitle: { margin: '0 0 20px', fontSize: 17, fontWeight: 600, color: '#1a7a4a' },
  avatar: {
    width: 64, height: 64, borderRadius: '50%', background: '#1a7a4a',
    color: '#fff', fontSize: 28, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  label: { fontSize: 12, color: '#888', marginBottom: 2 },
  value: { fontSize: 15, color: '#222', marginBottom: 14 },
  input: {
    width: '100%', padding: '10px 12px', marginBottom: 12, borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none',
  },
  btn: {
    padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: 14, background: '#1a7a4a', color: '#fff',
  },
  btnDanger: {
    padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: 14, background: '#e53935', color: '#fff',
  },
  btnDisabled: {
    padding: '10px 24px', borderRadius: 8, border: 'none',
    fontWeight: 600, fontSize: 14, background: '#ccc', color: '#fff', cursor: 'not-allowed',
  },
  success: {
    background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 12,
  },
  error: {
    background: '#fdecea', color: '#c62828', padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 12,
  },
  spinner: {
    width: 36, height: 36, border: '4px solid #e0e0e0',
    borderTop: '4px solid #1a7a4a', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', margin: '60px auto',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  dialog: {
    background: '#fff', borderRadius: 12, padding: 32, maxWidth: 380, width: '90%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)', textAlign: 'center',
  },
  dialogBtns: { display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 },
};

export default function Profile() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${auth?.token}` };
    axios.get(`${API}/profile`, { headers })
      .then(({ data }) => setProfile(data))
      .catch(() => setFetchError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [auth?.token]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    setPwLoading(true);
    const headers = { Authorization: `Bearer ${auth?.token}` };
    try {
      const { data } = await axios.put(`${API}/update-password`,
        { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
        { headers }
      );
      setPwMsg({ type: 'success', text: data.message });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const headers = { Authorization: `Bearer ${auth?.token}` };
    try {
      await axios.delete(`${API}/delete-account`, { headers });
      logout();
      navigate('/signup');
    } catch {
      setDeleteMsg('Failed to delete account. Please try again.');
      setShowConfirm(false);
    }
  };

  if (loading) return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={S.spinner} />
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Navbar />
      <div style={S.wrap}>
        <h2 style={{ margin: 0, color: '#1a7a4a' }}>My Profile</h2>

        {/* ── Section 1: Account Details ── */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Account Details</h3>
          {fetchError ? (
            <div style={S.error}>{fetchError}</div>
          ) : (
            <>
              <div style={S.avatar}>{profile?.name?.[0]?.toUpperCase()}</div>
              <div style={S.label}>Full Name</div>
              <div style={S.value}>{profile?.name}</div>
              <div style={S.label}>Email Address</div>
              <div style={S.value}>{profile?.email}</div>
              <div style={S.label}>Member Since</div>
              <div style={S.value}>
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </div>
            </>
          )}
        </div>

        {/* ── Section 2: Update Password ── */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Update Password</h3>
          {pwMsg.text && <div style={pwMsg.type === 'success' ? S.success : S.error}>{pwMsg.text}</div>}
          <form onSubmit={handlePasswordUpdate}>
            <input
              style={S.input} type="password" placeholder="Current Password"
              value={pwForm.currentPassword} required
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            />
            <input
              style={S.input} type="password" placeholder="New Password"
              value={pwForm.newPassword} required
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            />
            <input
              style={S.input} type="password" placeholder="Confirm New Password"
              value={pwForm.confirmPassword} required
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            />
            <button type="submit" style={pwLoading ? S.btnDisabled : S.btn} disabled={pwLoading}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* ── Section 3: Danger Zone ── */}
        <div style={S.dangerCard}>
          <h3 style={{ ...S.cardTitle, color: '#e53935' }}>Danger Zone</h3>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {deleteMsg && <div style={S.error}>{deleteMsg}</div>}
          <button style={S.btnDanger} onClick={() => setShowConfirm(true)}>
            Delete Account
          </button>
        </div>
      </div>

      {/* ── Confirmation Dialog ── */}
      {showConfirm && (
        <div style={S.overlay}>
          <div style={S.dialog}>
            <h3 style={{ margin: '0 0 10px', color: '#e53935' }}>Delete Account</h3>
            <p style={{ fontSize: 14, color: '#555' }}>
              Are you sure? This action <strong>cannot be undone</strong> and all your data will be permanently removed.
            </p>
            <div style={S.dialogBtns}>
              <button style={{ ...S.btn, background: '#888' }} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button style={S.btnDanger} onClick={handleDeleteAccount}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
