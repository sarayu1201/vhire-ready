import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Welcome, <strong>{auth?.user?.name}</strong></p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
