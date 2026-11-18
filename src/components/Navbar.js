import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;
const mobileLinkClass = ({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`;

// الصورة الشخصية، أو الحرف الأول لو مفيش صورة أو فشل تحميلها
const Avatar = ({ user }) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(user.profilePictureUrl) && !failed;

  return (
    <span className="user-avatar" aria-hidden="true">
      {showImage ? (
        <img
          src={`${BASE_URL}${user.profilePictureUrl}`}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        (user.firstName || 'U').charAt(0).toUpperCase()
      )}
    </span>
  );
};

const BrandIcon = () => (
  <svg
    className="brand-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 9v6" />
    <path d="M9 12h6" />
  </svg>
);

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
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // إغلاق القائمة بزر Escape
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <nav className="navbar-container" aria-label="التنقل الرئيسي">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <BrandIcon />
          <span className="brand-title">عيادتي</span>
        </Link>

        {/* روابط سطح المكتب */}
        <div className="navbar-desktop-links">
          <NavLink to="/" end className={navLinkClass}>
            الرئيسية
          </NavLink>
          <NavLink to="/doctors" className={navLinkClass}>
            الأطباء
          </NavLink>
          <NavLink to="/clinics" className={navLinkClass}>
            العيادات
          </NavLink>

          {user && user.role === 'Patient' && (
            <>
              <NavLink to="/patient/dashboard" className={navLinkClass}>
                لوحة التحكم
              </NavLink>
              <NavLink to="/patient/my-appointments" className={navLinkClass}>
                حجوزاتي
              </NavLink>
            </>
          )}
        </div>

        {/* الحساب وسطح المكتب */}
        <div className="navbar-desktop-auth">
          {user && user.role === 'Patient' && (
            <Link to="/patient/book" className="btn-highlight">
              احجز موعداً
            </Link>
          )}

          {user && user.role === 'Admin' && (
            <Link to="/admin/dashboard" className="btn-highlight admin-btn">
              لوحة الإدارة
            </Link>
          )}

          {user ? (
            <div className="user-profile-menu">
              <div className="user-info">
                <Avatar key={user.profilePictureUrl || 'no-pic'} user={user} />
                <span className="user-name">{user.firstName}</span>
              </div>
              <button type="button" onClick={handleLogout} className="btn-logout">
                <svg
                  className="logout-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>خروج</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                دخول
              </Link>
              <Link to="/register" className="btn-register">
                حساب جديد
              </Link>
            </div>
          )}
        </div>

        {/* زر القائمة للشاشات الصغيرة */}
        <button
          type="button"
          className={`mobile-toggle-btn${mobileMenuOpen ? ' active' : ''}`}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {/* غطاء الشاشة + القائمة المنزلقة (خارج الـ nav عشان تتحسب نسبة للشاشة) */}
      <div
        className={`mobile-drawer-overlay${mobileMenuOpen ? ' show' : ''}`}
        onClick={closeMenu}
      />

      <div className={`mobile-drawer${mobileMenuOpen ? ' open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-drawer-header">
          <span className="brand-title">عيادتي</span>
          <button type="button" className="mobile-close-btn" onClick={closeMenu} aria-label="إغلاق القائمة">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mobile-drawer-body">
          <nav className="mobile-nav-links" aria-label="القائمة الرئيسية للموبايل">
            <NavLink to="/" end className={mobileLinkClass}>
              الرئيسية
            </NavLink>
            <NavLink to="/doctors" className={mobileLinkClass}>
              الأطباء
            </NavLink>
            <NavLink to="/clinics" className={mobileLinkClass}>
              العيادات
            </NavLink>

            {user && user.role === 'Patient' && (
              <>
                <NavLink to="/patient/dashboard" className={mobileLinkClass}>
                  لوحة التحكم
                </NavLink>
                <NavLink to="/patient/my-appointments" className={mobileLinkClass}>
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
                  <Avatar key={user.profilePictureUrl || 'no-pic'} user={user} />
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
                <Link to="/login" className="btn-login text-center">
                  دخول
                </Link>
                <Link to="/register" className="btn-register text-center">
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

Navbar.displayName = 'Navbar';
export default Navbar;