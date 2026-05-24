import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

const COURSES = [
  { id: 1,  name: 'Full Stack Web Development',    link: 'https://learn.aajhub.in/courses/Full-Stack-Web-Development-Course-50Hours-Free-67defced1364e150f6f37c8d' },
  { id: 2,  name: 'Complete DSA Course',            link: 'https://learn.aajhub.in/courses/Complete-DSA-Course---Basics-to-Advanced-Copy-67ed61d86f19ad104513543f' },
  { id: 3,  name: 'Complete AWS Course',            link: 'https://learn.aajhub.in/courses/Complete-AWS-Course-For-Free-680aaac06fe58910c36e7dfe' },
  { id: 4,  name: 'Android and Kotlin Development', link: 'https://learn.aajhub.in/courses/Complete-Android-and-Kotlin-App-Development-Course-686ec906d8a03b0ef930a6b4' },
  { id: 5,  name: 'Complete DevOps Course',         link: 'https://learn.aajhub.in/courses/Complete-DevOps-Course-66fe8ea8f3cad41681343604' },
  { id: 6,  name: 'VLSI Design Course',             link: 'https://learn.aajhub.in/courses/VLSI-Design-Course-67955e4b38bd8c303f1c4bb4' },
  { id: 7,  name: 'Cloud Computing Course',         link: 'https://learn.aajhub.in/courses/Cloud-Computing-Course-1737759046215-6794194698974146d7c966aa' },
  { id: 8,  name: 'SQL Basic To Advanced',          link: 'https://learn.aajhub.in/courses/SQL-Basic-To-Advanced-20-Hours-66c37526b82c143d6f257bc9' },
  { id: 9,  name: 'Complete Ethical Hacking Course',link: 'https://learn.aajhub.in/courses/Complete-Ethical-Hacking-Course-Free-66e43fe3fc89131aaba27278' },
  { id: 10, name: 'Complete Java Developer Course', link: 'https://learn.aajhub.in/courses/Complete-Java-Developer-Course-670135a65ef93458627e2e4d' },
  { id: 11, name: 'Complete Python Course',         link: 'https://learn.aajhub.in/courses/Complete-Python-Course-66bf8c26d67934438d04f086-66bf8c26d67934438d04f086' },
  { id: 12, name: 'Complete C Programming Course',  link: 'https://learn.aajhub.in/courses/Complete-C-Programming-Course-66c1a86368ae8805087b4e56' },
];

const AdminDashboard = () => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('vhire_admin_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!adminToken);
  

  const [activeTab, setActiveTab] = useState('Pending');
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [allEnrollmentsFilter, setAllEnrollmentsFilter] = useState('all');
  
  const [screenshotModal, setScreenshotModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [approveModal, setApproveModal] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [expandedUsers, setExpandedUsers] = useState({});

  const handleLogout = useCallback(() => {
    setAdminToken('');
    localStorage.removeItem('vhire_admin_token');
    setIsAuthenticated(false);
    setStats(null);
    setEnrollments([]);
    setUsers([]);
  }, []);

  const fetchDashboardData = useCallback(async (token) => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [statsRes, enrollmentsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, { headers }),
        axios.get(`${API_URL}/api/admin/enrollments?status=all`, { headers }),
        axios.get(`${API_URL}/api/admin/users`, { headers })
      ]);

      setStats(statsRes.data);
      setEnrollments(enrollmentsRes.data);
      setUsers(usersRes.data);

      setIsAuthenticated(true);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (err.response && err.response.status === 404) {
        alert("404 Error: Admin routes not found! Please save your backend files and restart your Node.js server.");
        handleLogout();
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        handleLogout();
      } else {
        alert("Error loading dashboard data. Check the console for details.");
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    if (adminToken) {
      fetchDashboardData(adminToken);
    }
  }, [adminToken, fetchDashboardData]);

  const handleApprove = async (e) => {
    e.preventDefault();
    const course = COURSES.find(c => String(c.id) === String(selectedCourseId));
    if (!course) return alert('Please select a course');
    try {
      await axios.post(`${API_URL}/api/admin/approve/${approveModal}`,
        { courseLink: course.link, courseId: course.id },
        { headers: { 'Authorization': `Bearer ${adminToken}` } }
      );
      alert('Enrollment approved successfully');
      setApproveModal(null);
      setSelectedCourseId('');
      fetchDashboardData(adminToken);
    } catch (err) {
      alert('Error approving enrollment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/reject/${rejectModal}`, 
        { reason: rejectReason || 'Payment could not be verified.' },
        { headers: { 'Authorization': `Bearer ${adminToken}` } }
      );
      alert('Enrollment rejected successfully');
      setRejectModal(null);
      setRejectReason('');
      fetchDashboardData(adminToken);
    } catch (err) {
      alert('Error rejecting enrollment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their enrollments.')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      alert('User deleted successfully');
      fetchDashboardData(adminToken);
    } catch (err) {
      alert('Error deleting user: ' + (err.response?.data?.message || err.message));
    }
  };

  const viewScreenshot = async (filename, id) => {
    try {
      const identifier = filename ? filename.split(/[/\\]/).pop() : id;
      const res = await axios.get(`${API_URL}/api/admin/screenshot/${identifier}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
        responseType: 'blob'
      });
      const url = URL.createObjectURL(res.data);
      setScreenshotModal(url);
    } catch (err) {
      alert('Error loading screenshot: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleUserExpanded = (userId) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const styles = {
    container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px' },
    header: { backgroundColor: '#111827', color: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' },
    statRow: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' },
    statCard: { flex: 1, minWidth: '200px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    statLabel: { fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: 'bold' },
    statValue: { fontSize: '28px', fontWeight: 'bold', color: '#111827' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto' },
    tabButton: (active) => ({
      padding: '10px 20px', backgroundColor: active ? '#10b981' : '#e5e7eb', color: active ? '#fff' : '#374151',
      border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
    }),
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151', whiteSpace: 'nowrap' },
    td: { padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', whiteSpace: 'nowrap' },
    btnApprove: { backgroundColor: '#10b981', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' },
    btnReject: { backgroundColor: '#ef4444', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnDelete: { backgroundColor: '#ef4444', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnView: { backgroundColor: '#3b82f6', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    badge: (status) => ({
      padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block',
      backgroundColor: status === 'active' ? '#d1fae5' : status === 'rejected' ? '#fee2e2' : '#fef3c7',
      color: status === 'active' ? '#065f46' : status === 'rejected' ? '#991b1b' : '#92400e'
    }),
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modalContent: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Vhire Admin Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={styles.statRow}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #3b82f6' }}>
          <div style={styles.statLabel}>TOTAL USERS</div>
          <div style={styles.statValue}>{stats?.totalUsers || 0}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.statLabel}>TOTAL ENROLLMENTS</div>
          <div style={styles.statValue}>{stats?.totalEnrollments || 0}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ ...styles.statLabel, color: stats?.pendingEnrollments > 0 ? '#ef4444' : '#6b7280' }}>PENDING APPROVALS</div>
          <div style={{ ...styles.statValue, color: stats?.pendingEnrollments > 0 ? '#ef4444' : '#111827' }}>{stats?.pendingEnrollments || 0}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.statLabel}>TOTAL REVENUE</div>
          <div style={styles.statValue}>₹{stats?.totalRevenue || 0}</div>
        </div>
      </div>

      <div style={styles.tabs}>
        {['Pending', 'All Enrollments', 'Users', 'Revenue'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={styles.tabButton(activeTab === tab)}>
            {tab} {tab === 'Pending' && pendingEnrollments.length > 0 && `(${pendingEnrollments.length})`}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading data...</div>}
        
        {!loading && activeTab === 'Pending' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Pending Approvals</h2>
            {pendingEnrollments.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '18px' }}>No pending enrollments 🎉</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Mobile</th>
                      <th style={styles.th}>Course/Plan</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Submitted</th>
                      <th style={styles.th}>Screenshot</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingEnrollments.map(e => (
                      <tr key={e.enrollmentId}>
                        <td style={styles.td}>{e.userName}</td>
                        <td style={styles.td}>{e.userEmail}</td>
                        <td style={styles.td}>{e.mobile}</td>
                        <td style={styles.td}>{e.courseName || e.planName}</td>
                        <td style={styles.td}>₹{e.amount}</td>
                        <td style={styles.td}>{new Date(e.submittedAt).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <button onClick={() => viewScreenshot(e.screenshotFile, e.enrollmentId)} style={styles.btnView}>View</button>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => setApproveModal(e.enrollmentId)} style={styles.btnApprove}>Approve</button>
                          <button onClick={() => setRejectModal(e.enrollmentId)} style={styles.btnReject}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'All Enrollments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>All Enrollments</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'pending', 'active', 'rejected'].map(filter => (
                  <button 
                    key={filter} 
                    onClick={() => setAllEnrollmentsFilter(filter)}
                    style={{ ...styles.tabButton(allEnrollmentsFilter === filter), padding: '6px 12px', fontSize: '14px' }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Item</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Submitted</th>
                    <th style={styles.th}>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.filter(e => allEnrollmentsFilter === 'all' || e.status === allEnrollmentsFilter).map(e => (
                    <tr key={e.enrollmentId}>
                      <td style={styles.td}>{e.enrollmentId.slice(-6)}</td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 'bold' }}>{e.userName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{e.userEmail}</div>
                      </td>
                      <td style={styles.td}>{e.courseName || e.planName}</td>
                      <td style={styles.td}>₹{e.amount}</td>
                      <td style={styles.td}><span style={styles.badge(e.status)}>{e.status.toUpperCase()}</span></td>
                      <td style={styles.td}>{new Date(e.submittedAt || e.purchasedAt).toLocaleDateString()}</td>
                      <td style={styles.td}>{e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {enrollments.filter(e => allEnrollmentsFilter === 'all' || e.status === allEnrollmentsFilter).length === 0 && (
                    <tr><td colSpan="7" style={{ ...styles.td, textAlign: 'center' }}>No enrollments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'Users' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Registered Users</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Mobile</th>
                    <th style={styles.th}>Age</th>
                    <th style={styles.th}>Enrollments</th>
                    <th style={styles.th}>Total Paid</th>
                    <th style={styles.th}>Joined</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <React.Fragment key={u.id}>
                      <tr>
                        <td style={{ ...styles.td, cursor: 'pointer', color: '#3b82f6' }} onClick={() => toggleUserExpanded(u.id)}>
                          {u.name} {expandedUsers[u.id] ? '▼' : '▶'}
                        </td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{u.mobile}</td>
                        <td style={styles.td}>{u.age}</td>
                        <td style={styles.td}>{u.enrollmentCount}</td>
                        <td style={styles.td}>₹{u.totalPaid}</td>
                        <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <button onClick={() => handleDeleteUser(u.id)} style={styles.btnDelete}>Delete User</button>
                        </td>
                      </tr>
                      {expandedUsers[u.id] && (
                        <tr>
                          <td colSpan="8" style={{ backgroundColor: '#f9fafb', padding: '12px' }}>
                            <div style={{ fontSize: '14px' }}>
                              <strong>Active Courses/Plans:</strong> {u.activeCourses?.length > 0 ? u.activeCourses.join(', ') : 'None'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center' }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'Revenue' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Revenue Details</h2>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
              <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4' }}>
                <div style={styles.statLabel}>Total Revenue Collected</div>
                <div style={{ ...styles.statValue, color: '#065f46' }}>₹{stats?.totalRevenue || 0}</div>
              </div>
              <div style={{ ...styles.statCard, borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>
                <div style={styles.statLabel}>Pending Revenue</div>
                <div style={{ ...styles.statValue, color: '#92400e' }}>₹{stats?.pendingRevenue || 0}</div>
              </div>
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Paid Enrollments</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Item</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Approved Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.filter(e => e.status === 'active').length === 0 ? (
                    <tr><td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>No paid enrollments yet.</td></tr>
                  ) : (
                    enrollments.filter(e => e.status === 'active').map(e => (
                      <tr key={e.enrollmentId}>
                        <td style={styles.td}>{e.enrollmentId.slice(-6)}</td>
                        <td style={styles.td}>{e.userName}</td>
                        <td style={styles.td}>{e.courseName || e.planName}</td>
                        <td style={styles.td}>₹{e.amount}</td>
                        <td style={styles.td}>{new Date(e.approvedAt || e.submittedAt || e.purchasedAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {screenshotModal && (
        <div style={styles.modal} onClick={() => setScreenshotModal(null)}>
          <div style={{ ...styles.modalContent, padding: 0, textAlign: 'center', backgroundColor: 'transparent' }} onClick={e => e.stopPropagation()}>
            <img src={screenshotModal} alt="Screenshot" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => setScreenshotModal(null)} style={{ padding: '8px 16px', backgroundColor: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      
      {approveModal && (
        <div style={styles.modal} onClick={() => setApproveModal(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Approve Enrollment</h3>
            <form onSubmit={handleApprove}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>Select Course:</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px' }}
                  required
                >
                  <option value=''>-- Select a course --</option>
                  {COURSES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {selectedCourseId && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>
                    🔗 {COURSES.find(c => String(c.id) === String(selectedCourseId))?.link}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type='button' onClick={() => { setApproveModal(null); setSelectedCourseId(''); }} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type='submit' style={styles.btnApprove}>Confirm Approve</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {rejectModal && (
        <div style={styles.modal} onClick={() => setRejectModal(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Reject Enrollment</h3>
            <form onSubmit={handleReject}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>Rejection Reason:</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box', minHeight: '100px' }}
                  placeholder="e.g. Transaction ID not found or screenshot unclear..."
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setRejectModal(null)} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={styles.btnReject}>Confirm Reject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
