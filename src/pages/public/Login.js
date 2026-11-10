import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './AuthForm.css';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // تفعيل الأنيميشن الخفيف لصفحة الدخول
    AOS.init({
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      login(response);

      // التوجيه التلقائي حسب الصلاحية
      if (response.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
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

      if (response.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول باستخدام Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div 
        className="auth-card"
        data-aos="zoom-in-up" // كارت تسجيل الدخول يظهر بحركة زووم أنيقة وخفيفة
      >
        <div className="auth-header" data-aos="fade-down" data-aos-delay="100">
          <div className="auth-brand-logo">
            <svg
              className="auth-logo-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M12 9v6" />
              <path d="M9 12h6" />
            </svg>
          </div>
          <h2>تسجيل الدخول</h2>
          <p>أهلاً بك مجدداً في نظام عيادتي الطبي</p>
        </div>

        {error && (
          <div className="alert-error" role="alert" data-aos="shake">
            <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" data-aos="fade-up" data-aos-delay="200">
          <div className="form-group">
            <label htmlFor="emailOrPhone">البريد الإلكتروني أو رقم الهاتف</label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="emailOrPhone"
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                placeholder="user@example.com أو 010xxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="password">كلمة المرور</label>
              <Link to="/forgot-password" className="forgot-password-link">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
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

        <div className="auth-divider" data-aos="fade" data-aos-delay="300">
          <span>أو عبر</span>
        </div>

        {/* زر تسجيل الدخول بواسطة Google */}
        <div className="google-btn-wrapper" data-aos="fade-up" data-aos-delay="350">
          <GoogleOAuthProvider clientId="101061115056-eekaq21mrl35f6k6o092ina7grd6gtgp.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('حدث خطأ أثناء الاتصال بـ Google')}
              text="signin_with"
              shape="pill"
              locale="ar"
            />
          </GoogleOAuthProvider>
        </div>

        <div className="auth-footer" data-aos="fade-up" data-aos-delay="400">
          <p>
            ليس لديك حساب؟ <Link to="/register">إنشاء حساب مريض جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;