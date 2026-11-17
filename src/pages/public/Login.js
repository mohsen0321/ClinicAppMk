import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import AuthLayout from './AuthLayout';
import PasswordField from './PasswordField';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // التوجيه التلقائي حسب الصلاحية
  const redirectByRole = (role) => {
    navigate(role === 'Admin' ? '/admin/dashboard' : '/patient/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      login(response);
      redirectByRole(response.role);
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول، يرجى التأكد من البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      // إرسال الـ IdToken إلى الـ Backend
      const response = await api.post('/auth/google-login', {
        idToken: credentialResponse.credential,
      });
      login(response);
      redirectByRole(response.role);
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول باستخدام Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="تسجيل الدخول" subtitle="أهلاً بك مجدداً في نظام عيادتي الطبي">
      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="emailOrPhone">البريد الإلكتروني أو رقم الهاتف</label>
          <input
            id="emailOrPhone"
            className="ltr"
            type="text"
            name="emailOrPhone"
            autoComplete="username"
            value={formData.emailOrPhone}
            onChange={handleChange}
            placeholder="user@example.com أو 010xxxxxxxx"
            required
          />
        </div>

        <div className="form-group">
          <div className="label-wrapper">
            <label htmlFor="password">كلمة المرور</label>
            <Link to="/forgot-password" className="forgot-password-link">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <PasswordField
            id="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span className="btn-loading-state">
              <span className="spinner" />
              جاري التحقق...
            </span>
          ) : (
            'تسجيل الدخول'
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span>أو</span>
      </div>

      {/* زر تسجيل الدخول بواسطة Google */}
      <div className="google-btn-wrapper">
        <GoogleOAuthProvider clientId="101061115056-eekaq21mrl35f6k6o092ina7grd6gtgp.apps.googleusercontent.com">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('حدث خطأ أثناء الاتصال بـ Google')}
            text="signin_with"
            shape="rectangular"
            theme="outline"
            size="large"
            locale="ar"
          />
        </GoogleOAuthProvider>
      </div>

      <div className="auth-footer">
        <p>
          ليس لديك حساب؟ <Link to="/register">إنشاء حساب مريض جديد</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;