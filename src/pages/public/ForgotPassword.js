import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import './AuthForm.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: طلب الرمز، 2: إدخال الرمز والباسورد الجديد
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // إرسال طلب الـ OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMsg({ type: 'success', text: res.message });
      setStep(2); // الانتقال للخطوة الثانية
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'حدث خطأ أثناء إرسال الرمز' });
    } finally {
      setLoading(false);
    }
  };

  // تأكيد الرمز وتعيين كلمة المرور الجديدة
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setMsg({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmNewPassword,
      });

      setMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'فشل إعادة تعيين كلمة المرور' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>استعادة كلمة المرور</h2>
          <p>
            {step === 1
              ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز OTP'
              : `أدخل الرمز المرسل إلى (${email}) وكلمة المرور الجديدة`}
          </p>
        </div>

        {msg.text && (
          <div className={msg.type === 'success' ? 'alert-success' : 'alert-error'}>
            {msg.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="auth-form">
            <div className="form-group">
              <label>البريد الإلكتروني:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'جاري إرسال الرمز...' : 'إرسال رمز التحقق OTP '}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>رمز التحقق (6 أرقام):</label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="مثال: 123456"
                required
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }}
              />
            </div>

            <div className="form-group">
              <label>كلمة المرور الجديدة:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 أحرف أو أرقام على الأقل"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>تأكيد كلمة المرور الجديدة:</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'جاري التحديث...' : 'تأكيد وحفظ كلمة المرور الجديدة '}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setMsg({ type: '', text: '' }); }}
              style={{ background: 'none', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}
            >
              ← إعادة إرسال الرمز لبريد آخر
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>تذكرت كلمة المرور؟ <Link to="/login">العودة لتسجيل الدخول</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;