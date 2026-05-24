import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const API = `${API_URL}/api`;

const categoryColors = {
  Development: '#e8f5e9', Programming: '#e3f2fd', Cloud: '#e0f7fa',
  Mobile: '#fce4ec', DevOps: '#fff3e0', Electronics: '#f3e5f5',
  Database: '#fff8e1', Security: '#fbe9e7',
};
const categoryText = {
  Development: '#2e7d32', Programming: '#1565c0', Cloud: '#00695c',
  Mobile: '#880e4f', DevOps: '#e65100', Electronics: '#6a1b9a',
  Database: '#f57f17', Security: '#bf360c',
};

const S = {
  page: { minHeight: '100vh', background: '#f4f7f4', fontFamily: 'sans-serif' },
  banner: {
    background: 'linear-gradient(135deg,#1a7a4a,#145c38)', color: '#fff',
    padding: '28px 40px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
  },
  bannerText: { fontSize: 17, fontWeight: 600 },
  bannerBtn: {
    background: '#fff', color: '#1a7a4a', border: 'none', padding: '10px 22px',
    borderRadius: 24, fontWeight: 700, cursor: 'pointer', fontSize: 14,
  },
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '40px 20px' },
  sectionTitle: { fontSize: 22, fontWeight: 800, color: '#111', margin: '0 0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20, marginBottom: 60 },
  card: {
    background: '#fff', borderRadius: 14, padding: 22,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 10,
  },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
  courseName: { fontWeight: 700, fontSize: 16, color: '#111', lineHeight: 1.4 },
  meta: { fontSize: 13, color: '#666' },
  price: { fontSize: 18, fontWeight: 800, color: '#1a7a4a' },
  viewBtn: {
    marginTop: 'auto', background: '#1a7a4a', color: '#fff', border: 'none',
    padding: '10px 0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14,
  },
  plansSection: { marginTop: 20 },
  plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 },
  planCard: {
    background: '#fff', borderRadius: 14, padding: 28, textAlign: 'center',
    boxShadow: '0 2px 16px rgba(0,0,0,0.09)', border: '2px solid #e8f5e9',
  },
  planName: { fontWeight: 800, fontSize: 18, color: '#1a7a4a', marginBottom: 8 },
  planPrice: { fontSize: 32, fontWeight: 900, color: '#111', margin: '12px 0' },
  planDesc: { fontSize: 13, color: '#666', marginBottom: 20 },
  planBtn: {
    background: '#1a7a4a', color: '#fff', border: 'none', padding: '12px 0',
    borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15, width: '100%',
  },
};

export default function Courses() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const plansRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${auth?.token}` };
    axios.get(`${API}/courses`, { headers }).then(({ data }) => setCourses(data));
    axios.get(`${API}/courses/plans`, { headers }).then(({ data }) => setPlans(data));
  }, [auth?.token]);

  return (
    <div style={S.page}>
      <Navbar />

      <div style={S.banner}>
        <span style={S.bannerText}>🎓 Want All Courses? Get All Access Plans starting at ₹1,999</span>
        <button style={S.bannerBtn} onClick={() => plansRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          View Plans
        </button>
      </div>

      <div style={S.wrap}>
        <h2 style={S.sectionTitle}>All Courses</h2>
        <div style={S.grid}>
          {courses.map((c) => (
            <div key={c.id} style={S.card}>
              <span style={{ ...S.badge, background: categoryColors[c.category] || '#eee', color: categoryText[c.category] || '#333' }}>
                {c.category}
              </span>
              <div style={S.courseName}>{c.name}</div>
              <div style={S.meta}>⏱ {c.duration}</div>
              <div style={S.meta}>{c.description}</div>
              <div style={S.price}>₹{c.price}</div>
              <button style={S.viewBtn} onClick={() => navigate(`/courses/${c.id}`)}>
                View Details
              </button>
            </div>
          ))}
        </div>

        <div ref={plansRef} style={S.plansSection}>
          <h2 style={S.sectionTitle}>All Access Plans</h2>
          <p style={{ color: '#555', marginBottom: 24, fontSize: 14 }}>
            Get unlimited access to all 12 courses at one flat price.
          </p>
          <div style={S.plansGrid}>
            {plans.map((p) => (
              <div key={p.id} style={S.planCard}>
                <div style={S.planName}>{p.name}</div>
                <div style={S.planPrice}>₹{p.price.toLocaleString('en-IN')}</div>
                <div style={S.planDesc}>{p.description}</div>
                <button style={S.planBtn} onClick={() => navigate(`/survey`, { state: { type: 'plan', planId: p.id, planName: p.name, amount: p.price, duration: p.duration } })}>
                  Enroll Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
