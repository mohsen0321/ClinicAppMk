import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css'; // استيراد ملف الـ CSS الخاص بالمكتبة
import { api } from '../../services/api';
import './Home.css';

const Home = () => {
  const [specialties, setSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تفعيل الأنيميشن أول ما الصفحة تفتح
    AOS.init({
      duration: 800, // سرعة الحركة (أجزاء من الثانية عشان تفضل خفيفة)
      once: true,    // الحركة تحصل مرة واحدة بس وأنت نازل عشان ما تتقلش الصفحة
      easing: 'ease-out-cubic'
    });

    const fetchData = async () => {
      try {
        const [specsData, clinicsData] = await Promise.all([
          api.get('/specialties'),
          api.get('/clinics')
        ]);
        setSpecialties(specsData || []);
        setClinics(clinicsData || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* قسم الترحيب الرئيسي Hero Section */}
      <section className="hero-section">
        <div className="hero-backdrop-glow" />
        <div 
          className="hero-container"
          data-aos="fade-down"
        >
          <div className="hero-badge" data-aos="zoom-in" data-aos-delay="100">
            <span className="hero-badge-pulse" />
            <span>المنصة المعتمدة للرعاية الطبية الذكية</span>
          </div>

          <h1 className="hero-title">
            صحتك ورعايتك تبدأ من <span>هنا</span>
          </h1>
          <p className="hero-subtitle">
            احجز موعدك مع نخبة من أمهر الأطباء والاستشاريين في أفضل العيادات والمراكز التخصصية بخطوات سهلة ومباشرة.
          </p>

          <div className="hero-actions">
            <Link to="/doctors" className="btn-hero-primary">
              <span>تصفح الأطباء واحجز الآن</span>
              <svg className="btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>

            <Link to="/clinics" className="btn-hero-secondary">
              عرض العيادات المتاحة
            </Link>
          </div>
        </div>
      </section>

      {/* قسم مميزات المنصة */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
            <div className="feature-icon-wrapper">
              <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <polygon points="13 12 10 17 13 17 11 21 16 15 13 15 15 12" fill="currentColor"></polygon>
              </svg>
            </div>
            <h3>حجز فوري ومؤكد</h3>
            <p>اختر الطبيب والوقت المتاح الذي يناسبك بدون انتظار أو عناء في العيادة.</p>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
            <div className="feature-icon-wrapper">
              <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 0 0 4.5 2.6V7a5 5 0 0 0 10 0V2.6a.3.3 0 0 0-.3-.3h-1.4a.3.3 0 0 0-.3.3V7a3 3 0 0 1-6 0V2.6a.3.3 0 0 0-.3-.3H4.8z"></path>
                <path d="M9.5 12v2.5a4.5 4.5 0 0 0 9 0V13"></path>
                <circle cx="18.5" cy="9.5" r="3.5" fill="currentColor"></circle>
                <path d="M18.5 7.8l.5 1.1 1.2.2-.9.8.2 1.2-1-.5-1 .5.2-1.2-.9-.8 1.2-.2z" fill="#ffffff" stroke="none"></path>
              </svg>
            </div>
            <h3>أفضل الأطباء</h3>
            <p>نخبة من الاستشاريين والأخصائيين في كافة التخصصات بأعلى درجات الكفاءة.</p>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
            <div className="feature-icon-wrapper">
              <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 15l2 2 4-4" strokeWidth="2.5"></path>
              </svg>
            </div>
            <h3>إدارة حجوزاتك بسهولة</h3>
            <p>تابع حالة طلباتك وعُدّ لجدولك بكل بساطة وسلاسة من لوحة التحكم الخاصة بك.</p>
          </div>
        </div>
      </section>

      {/* قسم التخصصات الطبية */}
      <section className="section-container">
        <div className="section-header" data-aos="fade-right">
          <span className="section-tag">التخصصات</span>
          <h2>التخصصات الطبية المتاحة</h2>
          <p>اختر التخصص الذي ترغب في استشارته للوصول للأطباء المعتمدين</p>
        </div>

        {loading ? (
          <div className="grid-cards">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="grid-cards">
            {specialties.map((spec, index) => (
              <div 
                key={spec.id} 
                className="card specialty-card"
                data-aos="fade-up"
                data-aos-delay={index * 100} // كل كارت يطلع ورا الثاني بفرق بسيط يخلي الشكل تحفة
              >
                <div className="card-header">
                  <h3>{spec.name}</h3>
                  <span className="badge">
                    {spec.doctorsCount ?? 0} أطباء متاحين
                  </span>
                </div>
                <p className="card-description">
                  {spec.description || 'رعاية متكاملة وفق أحدث المعايير الطبية المعتمدة.'}
                </p>
                <Link to={`/doctors?specialtyId=${spec.id}`} className="card-link">
                  <span>عرض الأطباء</span>
                  <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* قسم العيادات */}
      <section className="section-container section-bg-alt">
        <div className="section-header" data-aos="fade-right">
          <span className="section-tag">الفروع والعيادات</span>
          <h2>عياداتنا ومراكزنا</h2>
          <p>عيادات مجهزة بأحدث التقنيات والمعدات الطبية لخدمتكم</p>
        </div>

        {loading ? (
          <div className="grid-cards">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="grid-cards">
            {clinics.map((clinic, index) => (
              <div 
                key={clinic.id} 
                className="card clinic-card"
                data-aos="zoom-in-up"
                data-aos-delay={index * 150}
              >
                <h3>{clinic.name}</h3>
                <div className="clinic-details">
                  <div className="clinic-detail-item">
                    <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{clinic.address}</span>
                  </div>
                  <div className="clinic-detail-item">
                    <svg className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span dir="ltr">{clinic.phoneNumber}</span>
                  </div>
                </div>
                <Link to={`/doctors?clinicId=${clinic.id}`} className="card-link">
                  <span>أطباء العيادة</span>
                  <svg className="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;