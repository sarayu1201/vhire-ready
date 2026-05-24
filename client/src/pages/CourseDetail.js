import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const API = `${API_URL}/api`;
const UPI_ID = '7671032823-2@ybl';

const S = {
  page: { minHeight: '100vh', background: '#f4f7f4', fontFamily: 'sans-serif' },
  wrap: { maxWidth: 800, margin: '0 auto', padding: '40px 20px' },
  card: { background: '#fff', borderRadius: 14, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: 32 },
  title: { fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 12 },
  desc: { fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 20 },
  meta: { fontSize: 14, color: '#666', marginBottom: 8 },
  price: { fontSize: 28, fontWeight: 900, color: '#1a7a4a', margin: '20px 0' },
  buyBtn: { background: '#1a7a4a', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: 'pointer' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#333', margin: '0 0 16px' },
  plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 },
  planCard: { background: '#f0faf4', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #c8e6c9' },
  planName: { fontWeight: 700, fontSize: 15, color: '#1a7a4a', marginBottom: 6 },
  planPrice: { fontSize: 22, fontWeight: 900, color: '#111', margin: '8px 0' },
  planBtn: { background: '#1a7a4a', color: '#fff', border: 'none', padding: '9px 0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, width: '100%', marginTop: 10 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 },
  modal: { background: '#fff', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 12px 48px rgba(0,0,0,0.22)', maxHeight: '92vh', overflowY: 'auto' },
  modalTitle: { fontSize: 21, fontWeight: 800, color: '#1a7a4a', marginBottom: 2, textAlign: 'center' },
  modalSub: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 16 },
  amountBox: { background: '#e8f5e9', borderRadius: 12, padding: '12px 18px', textAlign: 'center', marginBottom: 20 },
  amountLabel: { fontSize: 12, color: '#555', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  amountValue: { fontSize: 34, fontWeight: 900, color: '#1a7a4a' },
  qrWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 },
  qrBox: { border: '2px solid #e0e0e0', borderRadius: 14, padding: 14, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 10 },
  qrCaption: { fontSize: 13, color: '#555', textAlign: 'center' },
  stepsBox: { background: '#f9fafb', borderRadius: 10, padding: '12px 16px', marginBottom: 16, border: '1px solid #eee' },
  stepsTitle: { fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  step: { fontSize: 13, color: '#444', marginBottom: 5, lineHeight: 1.5, display: 'flex', gap: 8 },
  stepNum: { fontWeight: 700, color: '#1a7a4a', minWidth: 16 },
  fileLabel: { fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' },
  fileInput: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, marginBottom: 10, boxSizing: 'border-box' },
  previewWrap: { marginBottom: 14, textAlign: 'center' },
  preview: { maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #ddd', objectFit: 'cover' },
  fileNote: { fontSize: 12, color: '#2e7d32', marginBottom: 12 },
  btnRow: { display: 'flex', gap: 10, marginTop: 4 },
  confirmBtn: { flex: 1, background: '#1a7a4a', color: '#fff', border: 'none', padding: '13px 0', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  confirmBtnDisabled: { flex: 1, background: '#ccc', color: '#fff', border: 'none', padding: '13px 0', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'not-allowed' },
  cancelBtn: { flex: 1, background: 'transparent', color: '#888', border: '1px solid #ddd', padding: '13px 0', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
};

export default function CourseDetail() {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [plans, setPlans] = useState([]);
  const [modal, setModal] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${auth?.token}` };
    axios.get(`${API}/courses/${id}`, { headers }).then(({ data }) => setCourse(data));
    axios.get(`${API}/courses/plans`, { headers }).then(({ data }) => setPlans(data));
  }, [id, auth?.token]);

  const openModal = (payload) => { setModal(payload); setScreenshot(null); setPreviewUrl(null); };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirm = () => {
    if (!screenshot) return;
    if (modal.type === 'single') {
      navigate('/survey', {
        state: { type: 'single', courseId: modal.courseId, courseName: modal.courseName, amount: modal.amount },
      });
    } else {
      navigate('/survey', {
        state: { type: 'plan', planId: modal.planId, planName: modal.planName, amount: modal.amount, duration: modal.duration },
      });
    }
  };

  const upiString = modal
    ? `upi://pay?pa=${UPI_ID}&pn=Vhire&am=${modal.amount}&cu=INR&tn=${encodeURIComponent((modal.courseName || modal.planName || 'Vhire').replace(/\s+/g, '+'))}`
    : '';

  if (!course) return <div style={S.page}><Navbar /><div style={S.wrap}>Loading...</div></div>;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={S.title}>{course.name}</div>
          <div style={S.desc}>{course.description}</div>
          <div style={S.meta}>📂 Category: <strong>{course.category}</strong></div>
          <div style={S.meta}>⏱ Duration: <strong>{course.duration}</strong></div>
          <div style={S.price}>₹{course.price}</div>
          <button style={S.buyBtn} onClick={() => openModal({ type: 'single', courseId: course.id, courseName: course.name, amount: course.price })}>
            Buy This Course — ₹{course.price}
          </button>
        </div>

        <div style={S.card}>
          <div style={S.sectionTitle}>Or get ALL 12 courses with an All Access Plan</div>
          <div style={S.plansGrid}>
            {plans.map((p) => (
              <div key={p.id} style={S.planCard}>
                <div style={S.planName}>{p.name}</div>
                <div style={S.planPrice}>₹{p.price.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{p.description}</div>
                <button style={S.planBtn} onClick={() => openModal({ type: 'plan', planId: p.id, planName: p.name, amount: p.price, duration: p.duration })}>
                  Enroll Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && openModal(null)}>
          <div style={S.modal}>
            <div style={S.modalTitle}>Complete Your Payment</div>
            <div style={S.modalSub}>{modal.type === 'single' ? modal.courseName : modal.planName}</div>

            <div style={S.amountBox}>
              <div style={S.amountLabel}>Amount to Pay</div>
              <div style={S.amountValue}>₹{modal.amount?.toLocaleString('en-IN')}</div>
            </div>

            <div style={S.qrWrap}>
              <div style={S.qrBox}>
                <QRCodeSVG value={upiString} size={200} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>
              <div style={S.qrCaption}>Scan with PhonePe, GPay, or any UPI app</div>
            </div>

            <div style={S.stepsBox}>
              <div style={S.stepsTitle}>How to pay</div>
              {[
                'Open PhonePe or any UPI app on your phone',
                'Tap Scan QR and scan the code above',
                `Verify amount ₹${modal.amount?.toLocaleString('en-IN')} and complete payment`,
                'Take a screenshot of the success screen',
                'Upload screenshot below and click Confirm Payment',
              ].map((text, i) => (
                <div key={i} style={S.step}>
                  <span style={S.stepNum}>{i + 1}.</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <label style={S.fileLabel}>Upload Payment Screenshot *</label>
            <input style={S.fileInput} type="file" accept="image/*" onChange={handleFileChange} />
            {previewUrl && (
              <div style={S.previewWrap}>
                <img src={previewUrl} alt="preview" style={S.preview} />
              </div>
            )}
            {screenshot && !previewUrl && <div style={S.fileNote}>✓ {screenshot.name}</div>}

            <div style={S.btnRow}>
              <button style={S.cancelBtn} onClick={() => openModal(null)}>Cancel</button>
              <button
                style={screenshot ? S.confirmBtn : S.confirmBtnDisabled}
                disabled={!screenshot}
                onClick={handleConfirm}
              >
                Confirm Payment →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
