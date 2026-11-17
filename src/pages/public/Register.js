import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AuthLayout from './AuthLayout';
import PasswordField from './PasswordField';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      login(response);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      wide
      title="إنشاء حساب مريض جديد"
      subtitle="سجّل بياناتك لتتمكن من حجز المواعيد وإدارتها"
    >
      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">الاسم الأول</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              placeholder='mohsen'
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">الاسم الأخير</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              placeholder='khaled'
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              className="ltr"
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">رقم الهاتف</label>
            <input
              id="phoneNumber"
              className="ltr"
              type="tel"
              name="phoneNumber"
              autoComplete="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="01012345678"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <PasswordField
              id="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="******"
              required
              minLength={6}
            />
            <span className="form-hint">6 أحرف أو أرقام على الأقل</span>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="******"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <span className="btn-loading-state">
              <span className="spinner" />
              جاري إنشاء الحساب...
            </span>
          ) : (
            'إنشاء الحساب'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;