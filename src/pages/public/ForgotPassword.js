import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import AuthLayout from './AuthLayout';
import PasswordField from './PasswordField';

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
      setStep(2);
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

  const backToEmail = () => {
    setStep(1);
    setOtp('');
    setMsg({ type: '', text: '' });
  };

  const subtitle =
    step === 1 ? (
      'اكتب بريدك الإلكتروني المسجل وسنرسل لك رمز تحقق.'
    ) : (
      <>
        أرسلنا رمزًا من 6 أرقام إلى <bdi>{email}</bdi>. اكتبه هنا ثم اختر كلمة مرور جديدة.
      </>
    );

  return (
    <AuthLayout title="استعادة كلمة المرور" subtitle={subtitle}>
      <div className="auth-steps" role="img" aria-label={`الخطوة ${step} من 2`}>
        <span className="is-done" />
        <span className={step === 2 ? 'is-done' : ''} />
      </div>

      {msg.text && (
        <div
          className={msg.type === 'success' ? 'alert-success' : 'alert-error'}
          role={msg.type === 'error' ? 'alert' : 'status'}
        >
          {msg.text}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="auth-form">
          <div className="form-group">
            <label htmlFor="fp-email">البريد الإلكتروني</label>
            <input
              id="fp-email"
              className="ltr"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading-state">
                <span className="spinner" />
                جاري الإرسال...
              </span>
            ) : (
              'إرسال الرمز'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="form-group">
            <label htmlFor="fp-otp">رمز التحقق</label>
            <input
              id="fp-otp"
              className="input-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fp-new">كلمة المرور الجديدة</label>
            <PasswordField
              id="fp-new"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <span className="form-hint">6 أحرف أو أرقام على الأقل</span>
          </div>

          <div className="form-group">
            <label htmlFor="fp-confirm">تأكيد كلمة المرور</label>
            <PasswordField
              id="fp-confirm"
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading-state">
                <span className="spinner" />
                جاري الحفظ...
              </span>
            ) : (
              'حفظ كلمة المرور'
            )}
          </button>

          <button type="button" className="btn-link" onClick={backToEmail}>
            تغيير البريد الإلكتروني
          </button>
        </form>
      )}

      <div className="auth-footer">
        <p>
          تذكرت كلمة المرور؟ <Link to="/login">تسجيل الدخول</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;