import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const S = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 40px', height: 64, background: '#1a7a4a',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100,
  },
  brand: { color: '#fff', fontWeight: 800, fontSize: 22, textDecoration: 'none', letterSpacing: 1 },
  links: { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: { color: '#d4f5e2', textDecoration: 'none', fontSize: 14, padding: '6px 12px', borderRadius: 6 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  name: { color: '#d4f5e2', fontSize: 13 },
  accountLink: {
    color: '#fff', textDecoration: 'none', fontSize: 13, padding: '6px 14px',
    border: '1px solid rgba(255,255,255,0.45)', borderRadius: 20,
  },
  logout: {
    background: '#fff', border: 'none', color: '#1a7a4a',
    padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
};

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  if (!auth?.token) return null;
  return (
    <nav style={S.nav}>
      <Link to="/home" style={S.brand}>Vhire</Link>
      <div style={S.links}>
        <Link to="/home" style={S.navLink}>Home</Link>
        <Link to="/courses" style={S.navLink}>Courses</Link>
        <Link to="/my-courses" style={S.navLink}>My Courses</Link>
        <Link to="/about" style={S.navLink}>About Us</Link>
      </div>
      <div style={S.right}>
        <span style={S.name}>👋 {auth.user?.name}</span>
        <Link to="/profile" style={S.accountLink}>My Account</Link>
        <button style={S.logout} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>
    </nav>
  );
}
