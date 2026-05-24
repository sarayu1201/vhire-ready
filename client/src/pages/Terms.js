import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Terms() {
  const { pending, login } = useAuth();
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Guard: if no pending token, user didn't come from signup
  if (!pending) return <Navigate to="/signup" replace />;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 5;
    if (atBottom) setScrolledToBottom(true);
  };

  const handleContinue = () => {
    login(pending);       // commit token to AuthContext
    navigate('/home');
  };

  return (
    <div style={{ maxWidth: 640, margin: '50px auto', padding: 20 }}>
      <h2>Terms and Conditions</h2>
      <p style={{ color: '#555', marginBottom: 12 }}>
        Please read the following terms carefully before proceeding.
      </p>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          maxHeight: 400,
          overflowY: 'scroll',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: '16px 20px',
          background: '#fafafa',
          lineHeight: 1.7,
          fontSize: 14,
        }}
      >
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing or using the Vhire platform ("Service"), you agree to be bound by these
          Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use
          the Service. Vhire reserves the right to update these Terms at any time, and continued
          use of the Service constitutes acceptance of any revised Terms.
        </p>

        <h3>2. Nature of Service and Paid Access</h3>
        <p>
          Vhire provides introductory access to its platform at no charge. However, full course
          content, mentorship sessions, and certification programs are components of a paid
          program. All applicable fees will be clearly disclosed to you prior to enrollment in
          any paid tier. You will not be charged without your explicit consent at the point of
          purchase.
        </p>

        <h3>3. Acknowledgement of Paid Service</h3>
        <p>
          By proceeding beyond this page, you expressly acknowledge and agree that Vhire is
          a paid service for its full feature set. Vhire reserves the right, at its sole
          discretion, to limit, modify, or revoke free access to any portion of the platform
          at any time and without prior notice. Such limitations shall not entitle you to any
          refund or compensation for previously accessed free content.
        </p>

        <h3>4. User Obligations</h3>
        <p>
          You agree to provide accurate, current, and complete information during registration
          and to maintain the security of your account credentials. You are solely responsible
          for all activity that occurs under your account. Any misuse, fraudulent activity, or
          violation of these Terms may result in immediate suspension or termination of your
          account without liability to Vhire.
        </p>

        <h3>5. Intellectual Property</h3>
        <p>
          All content available through the Service, including but not limited to course
          materials, videos, assessments, and branding, is the exclusive intellectual property
          of Vhire or its licensors. You may not reproduce, distribute, or create derivative
          works from any content without prior written permission from Vhire.
        </p>

        <h3>6. Limitation of Liability</h3>
        <p>
          To the maximum extent permitted by applicable law, Vhire shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages arising out of
          or related to your use of the Service, even if Vhire has been advised of the
          possibility of such damages.
        </p>

        <h3>7. Governing Law</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the
          jurisdiction in which Vhire operates, without regard to its conflict of law
          provisions. Any disputes arising under these Terms shall be subject to the exclusive
          jurisdiction of the courts in that jurisdiction.
        </p>

        <h3>8. Contact</h3>
        <p>
          If you have any questions regarding these Terms, please contact us at
          support@vhire.com.
        </p>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: scrolledToBottom ? 'pointer' : 'not-allowed', color: scrolledToBottom ? '#000' : '#aaa' }}>
          <input
            type="checkbox"
            checked={agreed}
            disabled={!scrolledToBottom}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          I have read and agree to the Terms and Conditions
        </label>
        {!scrolledToBottom && (
          <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            Scroll to the bottom to enable this checkbox.
          </p>
        )}
      </div>

      <button
        onClick={handleContinue}
        disabled={!agreed}
        style={{
          marginTop: 20,
          width: '100%',
          padding: 12,
          background: agreed ? '#1a73e8' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 15,
          cursor: agreed ? 'pointer' : 'not-allowed',
        }}
      >
        Continue
      </button>
    </div>
  );
}
