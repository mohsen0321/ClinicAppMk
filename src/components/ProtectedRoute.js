import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: 'var(--primary)' }}>
        جاري التحميل...
      </div>
    );
  }

  // إذا لم يكن مسجل دخوله، وجهه إلى صفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // إذا كانت الصفحة تتطلب رتبة معينة والمستخدم لا يملكها (مثلاً مريض يحاول فتح لوحة الأدمن)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/patient/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;