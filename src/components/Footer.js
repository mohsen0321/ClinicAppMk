import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section" aria-label="تذييل الموقع">
      <div className="footer-container">
        {/* شبكة المحتوى الرئيسية */}
        <div className="footer-grid">
          {/* العمود الأول: الهوية والمعلومات */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <div className="footer-logo-wrapper">
                <svg
                  className="footer-logo-icon"
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
              <div className="footer-brand-text">
                <span className="footer-brand-title">عيادتي</span>
                <span className="footer-brand-tagline">Care Clinic System</span>
              </div>
            </Link>
            <p className="footer-description">
              المنصة الطبية المعتمدة لحجز مواعيد الأطباء وإدارة العيادات بسهولة، وتسهيل التواصل السريع بين المرضى والرعاية الصحية المتميزة.
            </p>
            <div className="footer-badge">
              <span className="pulse-dot"></span>
              <span>خدمة رعاية متواصلة 24/7</span>
            </div>
          </div>

          {/* العمود الثاني: روابط سريعة */}
          <div className="footer-links-col">
            <h4 className="footer-heading">روابط سريعة</h4>
            <ul className="footer-menu">
              <li><Link to="/">الرئيسية</Link></li>
              <li><Link to="/doctors">الأطباء</Link></li>
              <li><Link to="/clinics">العيادات</Link></li>
              <li><Link to="/patient/book">احجز موعداً</Link></li>
            </ul>
          </div>

          {/* العمود الثالث: خدمات المرضى */}
          <div className="footer-links-col">
            <h4 className="footer-heading">خدمات المرضى</h4>
            <ul className="footer-menu">
              <li><Link to="/patient/dashboard">لوحة التحكم</Link></li>
              <li><Link to="/patient/my-appointments">حجوزاتي</Link></li>
              {/* <li><a href="#faq">الأسئلة الشائعة</a></li> */}
              <li><a href="https://wa.me/201550019832" target="_blank" rel="noopener noreferrer">الدعم والمساندة</a></li>            </ul>
          </div>

          {/* العمود الرابع: معلومات التواصل */}
          <div className="footer-contact-col">
            <h4 className="footer-heading">التواصل والدعم</h4>
            <div className="footer-contact-list">
              <div className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>رقم الهاتف : 01550019832</span>
              </div>
              <div className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>mohsenkhaled000@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* الشريط السفلي الحقوق والروابط */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © {currentYear} جميع الحقوق محفوظة — <strong>نظام عيادتي الطبي Care Clinic</strong> | تم التطوير بواسطة <strong>Eng. Mohsen Khaled</strong>
          </p>
          <div className="footer-bottom-links">
            <a >سياسة الخصوصية</a>
            <span className="dot-divider">•</span>
            <a>الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;