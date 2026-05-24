import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const team = [
  { letter: 'R', name: 'Rahul Sharma',  role: 'Founder & CEO',        bio: 'Full stack developer with 8 years of industry experience' },
  { letter: 'P', name: 'Priya Reddy',   role: 'Head of Curriculum',   bio: 'Former software engineer turned educator with a passion for teaching' },
  { letter: 'A', name: 'Arjun Mehta',   role: 'Tech Lead',            bio: 'Cloud and DevOps expert with experience at top MNCs' },
];

const mission = [
  { icon: '🎯', title: 'Our Mission',  text: 'To make quality tech education accessible and affordable for every student in India, regardless of their background.' },
  { icon: '💡', title: 'Our Vision',   text: "To become India's most trusted platform for job-ready skill development and career transformation." },
  { icon: '🚀', title: 'Our Approach', text: 'Hands-on learning, real projects, expert mentorship, and placement-focused curriculum that gets you hired faster.' },
];

const features = [
  { stat: '12+ Courses',     desc: 'Industry relevant tech courses' },
  { stat: 'Expert Mentors',  desc: 'Learn from working professionals' },
  { stat: 'Affordable Plans',desc: 'Starting at just ₹100' },
  { stat: 'Job Focused',     desc: 'Curriculum built around hiring needs' },
];

const S = {
  page: { minHeight: '100vh', background: '#f4f7f4', fontFamily: 'sans-serif' },

  // Hero
  hero: {
    background: 'linear-gradient(135deg, #1a7a4a 0%, #0f4d2e 100%)',
    padding: '80px 20px', textAlign: 'center', color: '#fff',
  },
  heroTitle: { fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, margin: '0 0 16px' },
  heroSub: { fontSize: 18, color: '#c8f0da', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 },

  // Sections
  section: { maxWidth: 1060, margin: '0 auto', padding: '64px 20px' },
  sectionLabel: { fontSize: 12, fontWeight: 700, color: '#1a7a4a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  sectionTitle: { fontSize: 28, fontWeight: 800, color: '#111', margin: '0 0 20px' },
  sectionText: { fontSize: 16, color: '#555', lineHeight: 1.8, maxWidth: 720 },

  // Mission cards
  missionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, marginTop: 36 },
  missionCard: { background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 2px 14px rgba(0,0,0,0.07)' },
  missionIcon: { fontSize: 36, marginBottom: 14 },
  missionTitle: { fontSize: 17, fontWeight: 800, color: '#1a7a4a', marginBottom: 10 },
  missionText: { fontSize: 14, color: '#555', lineHeight: 1.7 },

  // Features
  featuresBg: { background: '#fff' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginTop: 36 },
  featureBox: {
    background: '#f0faf4', borderRadius: 12, padding: '24px 20px', textAlign: 'center',
    border: '1px solid #c8e6c9',
  },
  featureStat: { fontSize: 20, fontWeight: 900, color: '#1a7a4a', marginBottom: 6 },
  featureDesc: { fontSize: 13, color: '#555' },

  // Team
  teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, marginTop: 36 },
  teamCard: { background: '#fff', borderRadius: 14, padding: 28, textAlign: 'center', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' },
  avatar: {
    width: 72, height: 72, borderRadius: '50%', background: '#1a7a4a',
    color: '#fff', fontSize: 30, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  teamName: { fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 4 },
  teamRole: { fontSize: 13, fontWeight: 600, color: '#1a7a4a', marginBottom: 8 },
  teamBio: { fontSize: 13, color: '#666', lineHeight: 1.6 },

  // Contact
  contactBg: { background: 'linear-gradient(135deg,#1a7a4a,#0f4d2e)' },
  contactWrap: { maxWidth: 600, margin: '0 auto', padding: '64px 20px', textAlign: 'center', color: '#fff' },
  contactTitle: { fontSize: 28, fontWeight: 800, marginBottom: 12 },
  contactText: { fontSize: 15, color: '#c8f0da', lineHeight: 1.7, marginBottom: 8 },
  contactEmail: { fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 28, display: 'block' },
  contactBtn: {
    display: 'inline-block', background: '#fff', color: '#1a7a4a',
    padding: '13px 36px', borderRadius: 30, fontWeight: 700, fontSize: 15,
    textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
};

export default function About() {
  return (
    <div style={S.page}>
      <Navbar />

      {/* Hero */}
      <section style={S.hero}>
        <h1 style={S.heroTitle}>About Vhire</h1>
        <p style={S.heroSub}>Bridging the gap between education and employment</p>
      </section>

      {/* Who We Are */}
      <section style={S.section}>
        <p style={S.sectionLabel}>Our Story</p>
        <h2 style={S.sectionTitle}>Who We Are</h2>
        <p style={S.sectionText}>
          Vhire is a skill-focused ed-tech platform built for students and professionals who are
          serious about getting hired. We offer industry-relevant courses taught through structured
          learning paths, real-world projects, and expert guidance — everything you need to go from
          learning to earning.
        </p>
      </section>

      {/* Mission / Vision / Approach */}
      <div style={S.featuresBg}>
        <section style={S.section}>
          <p style={S.sectionLabel}>What Drives Us</p>
          <h2 style={S.sectionTitle}>Mission, Vision & Approach</h2>
          <div style={S.missionGrid}>
            {mission.map((m) => (
              <div key={m.title} style={S.missionCard}>
                <div style={S.missionIcon}>{m.icon}</div>
                <div style={S.missionTitle}>{m.title}</div>
                <p style={S.missionText}>{m.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Why Choose Vhire */}
      <section style={S.section}>
        <p style={S.sectionLabel}>Why Vhire</p>
        <h2 style={S.sectionTitle}>Why Choose Vhire</h2>
        <div style={S.featuresGrid}>
          {features.map((f) => (
            <div key={f.stat} style={S.featureBox}>
              <div style={S.featureStat}>{f.stat}</div>
              <div style={S.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <div style={S.featuresBg}>
        <section style={S.section}>
          <p style={S.sectionLabel}>The People</p>
          <h2 style={S.sectionTitle}>Our Team</h2>
          <div style={S.teamGrid}>
            {team.map((t) => (
              <div key={t.name} style={S.teamCard}>
                <div style={S.avatar}>{t.letter}</div>
                <div style={S.teamName}>{t.name}</div>
                <div style={S.teamRole}>{t.role}</div>
                <p style={S.teamBio}>{t.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Contact */}
      <div style={S.contactBg}>
        <div style={S.contactWrap}>
          <div style={S.contactTitle}>Get In Touch</div>
          <p style={S.contactText}>
            Have questions about our courses or need help choosing the right plan?
            We are here to help.
          </p>
          <a href="mailto:support@vhire.in" style={S.contactEmail}>support@vhire.in</a>
          <Link to="/courses" style={S.contactBtn}>Browse Courses →</Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px 20px', color: '#aaa', fontSize: 13, background: '#f4f7f4' }}>
        © {new Date().getFullYear()} Vhire. All rights reserved.
      </footer>
    </div>
  );
}
