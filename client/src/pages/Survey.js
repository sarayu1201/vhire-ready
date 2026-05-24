import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const API = `${API_URL}/api/enrollment`;

const S = {
  page: { minHeight: '100vh', background: '#f4f7f4', fontFamily: 'sans-serif' },
  wrap: { maxWidth: 560, margin: '0 auto', padding: '40px 20px' },
  card: { background: '#fff', borderRadius: 14, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  title: { fontSize: 22, fontWeight: 800, color: '#1a7a4a', marginBottom: 6 },
  sub: { fontSize: 14, color: '#666', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 4, display: 'block' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 16, boxSizing: 'border-box', background: '#fff' },
  readOnly: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #eee', fontSize: 14, marginBottom: 16, boxSizing: 'border-box', background: '#f9f9f9', color: '#555' },
  btn: { width: '100%', padding: 14, background: '#1a7a4a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 },
  btnDisabled: { width: '100%', padding: 14, background: '#ccc', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'not-allowed', marginTop: 8 },
  error: { background: '#fdecea', color: '#c62828', padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.5 },
  warning: { background: '#fff8e1', border: '1px solid #ffe082', color: '#7a5c00', padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.6 },
  success: { background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#1b5e20', padding: '20px 24px', borderRadius: 12, fontSize: 14, lineHeight: 1.8, textAlign: 'center' },
  fieldError: { fontSize: 12, color: '#c62828', marginTop: -12, marginBottom: 10 },
  fileNote: { fontSize: 12, color: '#2e7d32', marginTop: -4, marginBottom: 10 },
};

export default function Survey() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // All hooks first
  const [name, setName]             = useState('');
  const [age, setAge]               = useState('');
  const [mobile, setMobile]         = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [mobileError, setMobileError] = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // Guard after hooks — if no state at all, redirect
  const state = location.state;
  if (!state) return <Navigate to="/courses" replace />;

  const type     = state.type     || 'single';
  const planId   = state.planId   ? String(state.planId)   : null;
  const planName = state.planName || '';
  const courseName = state.courseName || '';
  const courseId = state.courseId ? String(state.courseId) : null;
  const amount   = state.amount   || 0;
  const duration = state.duration || null;

  const displayName = type === 'plan' ? planName : courseName;

  const validateMobile = (val) => {
    if (val && !/^\d{10}$/.test(val)) setMobileError('Enter a valid 10-digit mobile number');
    else setMobileError('');
  };

  const isValid = name.trim() && age && /^\d{10}$/.test(mobile) && screenshot;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('age', age);
      formData.append('mobile', mobile);
      formData.append('paymentScreenshot', screenshot);

      const token = auth?.token;
      const headers = { Authorization: `Bearer ${token}` };

      if (type === 'plan') {
        formData.append('planId', planId);
        formData.append('duration', String(duration || ''));
        await axios.post(`${API}/plan`, formData, { headers });
      } else {
        if (courseId) formData.append('courseId', courseId);
        await axios.post(`${API}/single`, formData, { headers });
      }

      setSubmitted(true);
      setTimeout(() => navigate('/my-courses'), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Enrollment failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={S.success}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Submitted successfully!</div>
            <div>Your payment is being verified by our team.</div>
            <div>You will receive access within <strong>2–4 hours</strong>.</div>
            <div style={{ marginTop: 8 }}>Check status in <strong>My Courses</strong>.</div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#388e3c' }}>Redirecting in 3 seconds...</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={S.title}>Pre-Enrollment Survey</div>
          <div style={S.sub}>Fill in your details to complete enrollment.</div>

          {error && <div style={S.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={S.label}>Full Name *</label>
            <input style={S.input} type="text" placeholder="Your full name" value={name}
              onChange={(e) => setName(e.target.value)} required />

            <label style={S.label}>Age *</label>
            <input style={S.input} type="number" placeholder="Your age" value={age} min={10} max={100}
              onChange={(e) => setAge(e.target.value)} required />

            <label style={S.label}>Mobile Number *</label>
            <input
              style={{ ...S.input, borderColor: mobileError ? '#e53935' : '#ddd' }}
              type="tel" placeholder="10-digit mobile number" value={mobile}
              onChange={(e) => { setMobile(e.target.value); validateMobile(e.target.value); }}
              required
            />
            {mobileError && <div style={S.fieldError}>{mobileError}</div>}

            <label style={S.label}>Selected {type === 'plan' ? 'Plan' : 'Course'}</label>
            <input style={S.readOnly} readOnly value={displayName} />

            <label style={S.label}>Amount Paid</label>
            <input style={S.readOnly} readOnly value={`₹${Number(amount).toLocaleString('en-IN')}`} />

            {type === 'plan' && duration && (
              <>
                <label style={S.label}>Plan Duration</label>
                <input style={S.readOnly} readOnly value={`${duration} Months`} />
              </>
            )}

            <div style={S.warning}>
              ⚠️ Each payment screenshot can only be used once. Upload the original screenshot
              from your most recent payment. Reusing screenshots will be rejected.
            </div>

            <label style={S.label}>Upload PhonePe Payment Screenshot *</label>
            <input
              style={{ ...S.input, padding: '8px 12px' }}
              type="file" accept="image/*"
              onChange={(e) => setScreenshot(e.target.files[0])}
              required
            />
            {screenshot && (
              <div style={S.fileNote}>
                ✓ {screenshot.name} ({(screenshot.size / 1024).toFixed(1)} KB)
              </div>
            )}

            <button
              type="submit"
              style={isValid && !loading ? S.btn : S.btnDisabled}
              disabled={!isValid || loading}
            >
              {loading ? 'Submitting...' : 'Submit & Confirm Enrollment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
