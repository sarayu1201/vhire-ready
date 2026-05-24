import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const API = `${API_URL}/api`;

const S = {
  page: { minHeight: '100vh', background: '#f4f7f4', fontFamily: 'sans-serif' },
  wrap: { maxWidth: 640, margin: '0 auto', padding: '60px 20px' },
  card: { background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 2px 20px rgba(0,0,0,0.09)', textAlign: 'center' },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 10 },
  courseName: { fontSize: 18, fontWeight: 700, color: '#1a7a4a', marginBottom: 8 },
  desc: { fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 8 },
  meta: { fontSize: 13, color: '#888', marginBottom: 24 },
  startBtn: {
    display: 'inline-block', background: '#1a7a4a', color: '#fff', textDecoration: 'none',
    padding: '15px 44px', borderRadius: 32, fontWeight: 700, fontSize: 16,
    boxShadow: '0 4px 16px rgba(26,122,74,0.3)',
  },
  pendingBox: {
    background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 12,
    padding: '20px 24px', marginBottom: 24, fontSize: 14, color: '#7a5c00', lineHeight: 1.8, textAlign: 'left',
  },
  rejectedBox: {
    background: '#fdecea', border: '1px solid #f5c2c2', borderRadius: 12,
    padding: '20px 24px', marginBottom: 24, fontSize: 14, color: '#c62828', lineHeight: 1.8, textAlign: 'left',
  },
  expiredBox: {
    background: '#fdecea', border: '1px solid #f5c2c2', borderRadius: 12,
    padding: '16px 20px', marginBottom: 24, fontSize: 14, color: '#c62828', lineHeight: 1.6,
  },
  renewBtn: {
    display: 'inline-block', background: '#e53935', color: '#fff', textDecoration: 'none',
    padding: '12px 32px', borderRadius: 28, fontWeight: 700, fontSize: 14, marginRight: 12,
  },
  outlineBtn: {
    display: 'inline-block', background: 'transparent', color: '#1a7a4a',
    border: '2px solid #1a7a4a', textDecoration: 'none',
    padding: '10px 28px', borderRadius: 28, fontWeight: 700, fontSize: 14,
  },
};

export default function CourseAccess() {
  const { courseId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [access, setAccess] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${auth?.token}` };
    axios.get(`${API}/enrollment/check/${courseId}`, { headers })
      .then(({ data }) => {
        setAccess(data);
        if (!data.hasAccess && data.reason === 'none') navigate(`/courses/${courseId}`, { replace: true });
      });
    axios.get(`${API}/courses/${courseId}`, { headers }).then(({ data }) => setCourse(data));
  }, [courseId, auth?.token, navigate]);

  if (!access || !course) return (
    <div style={S.page}><Navbar />
      <div style={S.wrap}><div style={{ textAlign: 'center', color: '#888', paddingTop: 60 }}>Loading...</div></div>
    </div>
  );

  const courseLink = access.courseLink || course.link;
  const expiredDate = access.expiresAt
    ? new Date(access.expiresAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={S.courseName}>{course.name}</div>

          {/* ACTIVE */}
          {access.hasAccess && (
            <>
              <div style={S.icon}>🎉</div>
              <div style={S.title}>You're enrolled!</div>
              <div style={S.desc}>{course.description}</div>
              <div style={S.meta}>📂 {course.category} &nbsp;·&nbsp; ⏱ {course.duration}</div>
              <a href={courseLink} target="_blank" rel="noopener noreferrer" style={S.startBtn}>
                🚀 Start Course
              </a>
            </>
          )}

          {/* PENDING */}
          {!access.hasAccess && access.reason === 'pending' && (
            <>
              <div style={S.icon}>⏳</div>
              <div style={S.title}>Enrollment Under Review</div>
              <div style={S.pendingBox}>
                <strong>⏳ Your enrollment is under review.</strong><br />
                Our team is verifying your payment screenshot.<br />
                You will get access within <strong>2–4 hours</strong> after verification.<br />
                Thank you for your patience!
              </div>
              <Link to="/my-courses" style={S.outlineBtn}>View My Courses</Link>
            </>
          )}

          {/* REJECTED */}
          {!access.hasAccess && access.reason === 'rejected' && (
            <>
              <div style={S.icon}>❌</div>
              <div style={S.title}>Enrollment Rejected</div>
              <div style={S.rejectedBox}>
                <strong>❌ Your enrollment was rejected.</strong><br />
                Reason: {access.rejectionReason}<br /><br />
                Please contact <strong>support@vhire.in</strong> or re-enroll with the correct payment screenshot.
              </div>
              <Link to={`/courses/${courseId}`} style={S.renewBtn}>Try Again</Link>
              <Link to="/my-courses" style={S.outlineBtn}>My Courses</Link>
            </>
          )}

          {/* EXPIRED */}
          {!access.hasAccess && access.reason === 'expired' && (
            <>
              <div style={S.icon}>⏰</div>
              <div style={S.title}>Access Expired</div>
              <div style={S.expiredBox}>
                Your access plan has expired on <strong>{expiredDate}</strong>.<br />
                Please renew your plan to continue accessing this course.
              </div>
              <Link to="/courses" style={S.renewBtn}>Renew Plan</Link>
              <Link to="/my-courses" style={S.outlineBtn}>My Courses</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
