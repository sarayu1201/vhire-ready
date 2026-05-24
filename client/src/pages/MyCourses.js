import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const API = `${API_URL}/api/enrollment/my-courses`;

const badgeStyle = {
  active:   { background: '#e8f5e9', color: '#2e7d32' },
  pending:  { background: '#fff8e1', color: '#7a5c00' },
  rejected: { background: '#fdecea', color: '#c62828' },
  expired:  { background: '#f3e5f5', color: '#6a1b9a' },
};
const badgeLabel = {
  active: '✓ Active', pending: '⏳ Pending Verification',
  rejected: '✗ Rejected', expired: '✗ Expired',
};

const S = {
  page: { minHeight: '100vh', background: '#f4f7f4', fontFamily: 'sans-serif' },
  wrap: { maxWidth: 900, margin: '0 auto', padding: '40px 20px' },
  title: { fontSize: 24, fontWeight: 800, color: '#1a7a4a', marginBottom: 24 },
  empty: { textAlign: 'center', color: '#888', fontSize: 15, padding: '60px 20px' },
  card: {
    background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex',
    justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
  },
  left: { flex: 1 },
  courseName: { fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 6 },
  meta: { fontSize: 13, color: '#666', marginBottom: 3 },
  badge: { display: 'inline-block', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, marginTop: 8 },
  rejectedReason: { background: '#fdecea', border: '1px solid #f5c2c2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c62828', marginTop: 10, lineHeight: 1.5 },
  pendingNote: { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#7a5c00', marginTop: 10, lineHeight: 1.5 },
  renewBox: { background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: 10, padding: 14, fontSize: 13, color: '#e65100', marginTop: 10 },
  btn: { background: '#1a7a4a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  btnDisabled: { background: '#ccc', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'not-allowed', display: 'inline-block' },
};

export default function MyCourses() {
  const { auth } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${auth?.token}` };
    axios.get(API, { headers }).then(({ data }) => setEnrollments(data)).finally(() => setLoading(false));
  }, [auth?.token]);

  const daysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div style={S.page}><Navbar /><div style={S.wrap}>Loading...</div></div>;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>
        <h2 style={S.title}>My Courses</h2>

        {enrollments.length === 0 ? (
          <div style={S.empty}>
            You haven't enrolled in any courses yet.<br />
            <Link to="/courses" style={{ color: '#1a7a4a', fontWeight: 700 }}>Browse Courses</Link>
          </div>
        ) : (
          enrollments.map((e) => {
            const status = e.status || 'pending';
            const isActive = status === 'active';
            const days = daysRemaining(e.expiresAt);

            return (
              <div key={e.id} style={S.card}>
                <div style={S.left}>
                  <div style={S.courseName}>{e.type === 'single' ? e.courseName : e.planName}</div>
                  <div style={S.meta}>📦 {e.type === 'single' ? 'Single Purchase' : 'All Access Plan'}</div>
                  <div style={S.meta}>📅 Submitted: {new Date(e.submittedAt || e.purchasedAt).toLocaleDateString('en-IN')}</div>
                  {isActive && e.expiresAt && (
                    <div style={S.meta}>
                      ⏳ Expires: {new Date(e.expiresAt).toLocaleDateString('en-IN')}
                      {days !== null && days > 0 && ` (${days} days left)`}
                    </div>
                  )}

                  <span style={{ ...S.badge, ...(badgeStyle[status] || badgeStyle.pending) }}>
                    {badgeLabel[status] || status}
                  </span>

                  {status === 'pending' && (
                    <div style={S.pendingNote}>
                      Our team is verifying your payment. Access will be granted within 2–4 hours.
                    </div>
                  )}
                  {status === 'rejected' && (
                    <div style={S.rejectedReason}>
                      <strong>Rejection reason:</strong> {e.rejectionReason || 'Payment could not be verified.'}<br />
                      Please contact <strong>support@vhire.in</strong> or re-enroll.
                    </div>
                  )}
                  {status === 'expired' && (
                    <div style={S.renewBox}>
                      Plan expired on {new Date(e.expiresAt).toLocaleDateString('en-IN')}.{' '}
                      <Link to="/courses" style={{ color: '#1a7a4a', fontWeight: 700 }}>Renew access</Link>
                    </div>
                  )}
                </div>

                <div>
                  {e.type === 'single' && e.courseLink && isActive && (
                    <a href={e.courseLink} target="_blank" rel="noopener noreferrer" style={S.btn}>
                      Start Course
                    </a>
                  )}
                  {e.type === 'single' && !isActive && (
                    <span style={S.btnDisabled}>
                      {status === 'pending' ? 'Pending' : status === 'rejected' ? 'Rejected' : 'Expired'}
                    </span>
                  )}
                  {e.type === 'plan' && (
                    <Link to="/courses" style={isActive ? S.btn : S.btnDisabled}>
                      {isActive ? 'Browse Courses' : status === 'pending' ? 'Pending' : 'Renew Plan'}
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
