import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: '🏫',
    title: 'About Vhire',
    desc: 'Vhire is a career-focused learning platform built to bridge the gap between education and employment through structured, industry-aligned programs.',
  },
  {
    icon: '🎓',
    title: 'Course Quality',
    desc: 'Every course is crafted by industry experts and updated regularly to reflect real-world demands, ensuring you learn skills that employers actually want.',
  },
  {
    icon: '🤝',
    title: 'Mentorship',
    desc: 'Get paired with experienced mentors who guide you through your learning journey, review your work, and help you navigate your career path.',
  },
  {
    icon: '📜',
    title: 'Certification',
    desc: 'Earn industry-recognised certificates upon course completion that you can showcase on your resume and LinkedIn profile to stand out to recruiters.',
  },
];

const coursePreview = [
  { title: 'Full-Stack Web Development', level: 'Beginner → Advanced', duration: '12 weeks', color: '#e8f5e9' },
  { title: 'Data Science & Machine Learning', level: 'Intermediate', duration: '10 weeks', color: '#e3f2fd' },
  { title: 'UI/UX Design Fundamentals', level: 'Beginner', duration: '6 weeks', color: '#fff3e0' },
];

const S = {
  page: { minHeight: '100vh', background: '#f4f7f4', fontFamily: 'sans-serif' },

  // Hero
  hero: {
    background: 'linear-gradient(135deg, #1a7a4a 0%, #145c38 100%)',
    color: '#fff', textAlign: 'center', padding: '90px 20px 80px',
  },
  heroTag: {
    display: 'inline-block', background: 'rgba(255,255,255,0.15)',
    borderRadius: 20, padding: '4px 16px', fontSize: 13, marginBottom: 20, letterSpacing: 1,
  },
  heroTitle: { fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 },
  heroSub: { fontSize: 17, color: '#c8f0da', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.6 },
  heroBtn: {
    display: 'inline-block', background: '#fff', color: '#1a7a4a',
    padding: '14px 36px', borderRadius: 30, fontWeight: 700, fontSize: 15,
    textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },

  // Section
  section: { maxWidth: 1080, margin: '0 auto', padding: '70px 20px' },
  sectionLabel: { color: '#1a7a4a', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  sectionTitle: { fontSize: 28, fontWeight: 800, color: '#111', margin: '0 0 40px' },

  // Feature cards
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 },
  featureCard: {
    background: '#fff', borderRadius: 14, padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'transform 0.2s',
  },
  featureIcon: { fontSize: 32, marginBottom: 12 },
  featureTitle: { fontWeight: 700, fontSize: 16, color: '#1a7a4a', marginBottom: 8 },
  featureDesc: { fontSize: 14, color: '#555', lineHeight: 1.6 },

  // Courses preview
  coursesBg: { background: '#fff' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 },
  courseCard: { borderRadius: 12, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  courseTitle: { fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 8 },
  courseMeta: { fontSize: 13, color: '#666', marginBottom: 4 },
  viewAll: {
    display: 'inline-block', marginTop: 36, background: '#1a7a4a', color: '#fff',
    padding: '12px 32px', borderRadius: 28, fontWeight: 600, fontSize: 14, textDecoration: 'none',
  },
};

export default function Home() {
  const { auth } = useAuth();

  return (
    <div style={S.page}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={S.hero}>
        <span style={S.heroTag}>🚀 Your Career Starts Here</span>
        <h1 style={S.heroTitle}>Learn. Grow. Get Hired.</h1>
        <p style={S.heroSub}>
          Welcome back, <strong>{auth?.user?.name}</strong>! Vhire gives you the skills,
          mentorship, and certification you need to land your dream job.
        </p>
        <Link to="/courses" style={S.heroBtn}>Explore Courses →</Link>
      </section>

      {/* ── Features ── */}
      <section style={S.section}>
        <p style={S.sectionLabel}>Why Vhire</p>
        <h2 style={S.sectionTitle}>Everything you need to succeed</h2>
        <div style={S.featureGrid}>
          {features.map((f) => (
            <div key={f.title} style={S.featureCard}>
              <div style={S.featureIcon}>{f.icon}</div>
              <div style={S.featureTitle}>{f.title}</div>
              <p style={S.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Courses Preview ── */}
      <div style={S.coursesBg}>
        <section style={S.section}>
          <p style={S.sectionLabel}>Courses</p>
          <h2 style={S.sectionTitle}>Popular programs on Vhire</h2>
          <div style={S.coursesGrid}>
            {coursePreview.map((c) => (
              <div key={c.title} style={{ ...S.courseCard, background: c.color }}>
                <div style={S.courseTitle}>{c.title}</div>
                <div style={S.courseMeta}>📊 {c.level}</div>
                <div style={S.courseMeta}>⏱ {c.duration}</div>
              </div>
            ))}
          </div>
          <Link to="/courses" style={S.viewAll}>View All Courses →</Link>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer style={{ textAlign: 'center', padding: '28px 20px', color: '#aaa', fontSize: 13, background: '#f4f7f4' }}>
        © {new Date().getFullYear()} Vhire. All rights reserved.
      </footer>
    </div>
  );
}
