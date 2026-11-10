import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { api, BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // إغلاق قائمة الموبايل فور الانتقال بين الصفحات
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // منع التمرير في الخلفية عند فتح قائمة الموبايل
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  // دالة عرض الصورة أو الحرف الأول بالحجم الصغير والثابت
  const renderAvatar = () => {
    if (user && user.profilePictureUrl) {
      return (
        <img
          src={`${BASE_URL}${user.profilePictureUrl}`}
          alt={user.firstName || 'User'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
      );
    }
    return null;
  };

  return (
    <header className="navbar-header">
      <nav className="navbar-container" aria-label="التنقل الرئيسي">
        {/* الشعار واسم الموقع */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon-wrapper">
            <svg
              className="brand-icon"
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
          <div className="brand-text-group">
            <span className="brand-title">عيادتي</span>
            <span className="brand-subtitle">Care Clinic</span>
          </div>
        </Link>

        {/* الروابط العامة للمكتب */}
        <div className="navbar-desktop-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            الرئيسية
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            الأطباء
          </NavLink>
          <NavLink to="/clinics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            العيادات
          </NavLink>

          {user && user.role === 'Patient' && (
            <>
              <NavLink to="/patient/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                لوحة التحكم
              </NavLink>
              <NavLink to="/patient/my-appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                حجوزاتي
              </NavLink>
              <Link to="/patient/book" className="btn-highlight">
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>احجز موعداً</span>
              </Link>
            </>
          )}

          {user && user.role === 'Admin' && (
            <Link to="/admin/dashboard" className="btn-highlight admin-btn">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>لوحة الإدارة</span>
            </Link>
          )}
        </div>

        {/* أزرار الحساب للمكتب */}
        <div className="navbar-desktop-auth">
          {user ? (
            <div className="user-profile-menu">
              <div className="user-avatar-badge">
                <span className="user-avatar-initial" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderAvatar()}
                  <span style={{ display: user.profilePictureUrl ? 'none' : 'flex' }}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </span>
                <span className="user-greeting">
                  مرحباً، <strong>{user.firstName}</strong>
                </span>
              </div>
              <button type="button" onClick={handleLogout} className="btn-logout" aria-label="تسجيل الخروج">
                <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>خروج</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">دخول</Link>
              <Link to="/register" className="btn-register">حساب جديد</Link>
            </div>
          )}
        </div>

        {/* زر التبديل للشاشات الصغيرة */}
        <button
          type="button"
          className={`mobile-toggle-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* غطاء الشاشة عند فتح القائمة */}
        <div
          className={`mobile-drawer-overlay ${mobileMenuOpen ? 'show' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* قائمة الموبايل المنزلقة */}
        <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
          <div className="mobile-drawer-header">
            <div className="brand-text-group">
              <span className="brand-title">عيادتي</span>
              <span className="brand-subtitle">Care Clinic</span>
            </div>
          </div>

          <div className="mobile-drawer-body">
            <nav className="mobile-nav-links">
              <NavLink to="/" end className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                الرئيسية
              </NavLink>
              <NavLink to="/doctors" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                الأطباء
              </NavLink>
              <NavLink to="/clinics" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                العيادات
              </NavLink>

              {user && user.role === 'Patient' && (
                <>
                  <NavLink to="/patient/dashboard" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                    لوحة التحكم
                  </NavLink>
                  <NavLink to="/patient/my-appointments" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                    حجوزاتي
                  </NavLink>
                  <Link to="/patient/book" className="btn-highlight mobile-btn-highlight">
                    احجز موعداً
                  </Link>
                </>
              )}

              {user && user.role === 'Admin' && (
                <Link to="/admin/dashboard" className="btn-highlight admin-btn mobile-btn-highlight">
                  لوحة الإدارة 
                </Link>
              )}
            </nav>

            <div className="mobile-drawer-footer">
              {user ? (
                <div className="mobile-user-card">
                  <div className="mobile-user-info">
                    <span className="user-avatar-initial" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderAvatar()}
                      <span style={{ display: user.profilePictureUrl ? 'none' : 'flex' }}>
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </span>
                    <div className="mobile-user-text">
                      <span className="user-name">{user.firstName}</span>
                      <span className="user-role">{user.role === 'Admin' ? 'مدير النظام' : 'مريض'}</span>
                    </div>
                  </div>
                  <button type="button" onClick={handleLogout} className="btn-logout mobile-logout-btn">
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-grid">
                  <Link to="/login" className="btn-login text-center">دخول</Link>
                  <Link to="/register" className="btn-register text-center">حساب جديد</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;