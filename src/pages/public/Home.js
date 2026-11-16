import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import './Home.css';
import clinicimage from './clinicimage.png'; // عدل المسار حسب مكان الصورة الفعلي عندك
const Home = () => {
  const [specialties, setSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [specsRes, clinicsRes] = await Promise.all([
          api.get('/specialties'),
          api.get('/clinics')
        ]);

        const extractData = (res) => {
          if (Array.isArray(res)) return res;
          if (res && Array.isArray(res.data)) return res.data;
          if (res && Array.isArray(res.result)) return res.result;
          return [];
        };

        setSpecialties(extractData(specsRes));
        setClinics(extractData(clinicsRes));
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('تعذر تحميل بيانات المنصة، يجدر التأكد من تشغيل السيرفر والاتصال بالخادم.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* قسم الترحيب الرئيسي Hero Section */}
      <section className="hero-section" style={{ backgroundImage: `url(${clinicimage})` }}>
        <div className="hero-overlay" />
        <div className="hero-backdrop-glow" />
        <motion.div
          className="hero-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span className="hero-badge-pulse" />
            <span>المنصة المعتمدة للرعاية الطبية الذكية</span>
          </motion.div>

          <h1 className="hero-title">
            صحتك ورعايتك تبدأ من <span>هنا</span>
          </h1>
          <p className="hero-subtitle">
            احجز موعدك مع نخبة من أمهر الأطباء والاستشاريين في أفضل العيادات والمراكز التخصصية بخطوات سهلة ومباشرة.
          </p>

          <div className="hero-actions">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link to="/doctors" className="btn-hero-primary pulsating-btn">
                <span>تصفح الأطباء واحجز الآن</span>
                <svg className="btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </Link>
            </motion.div>

            <Link to="/clinics" className="btn-hero-secondary">
              عرض العيادات المتاحة
            </Link>
          </div>
        </motion.div>
      </section>

      {/* قسم رسالة الخطأ إن وجدت */}
      {error && (
        <div style={{ maxWidth: '600px', margin: '1rem auto', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* قسم مميزات المنصة */}
      <section className="features-section">
        <div className="features-container">
          {[
            { title: "حجز فوري ومؤكد", desc: "اختر الطبيب والوقت المتاح الذي يناسبك بدون انتظار أو عناء في العيادة.", delay: 0.1 },
            { title: "أفضل الأطباء", desc: "نخبة من الاستشاريين والأخصائيين في كافة التخصصات بأعلى درجات الكفاءة.", delay: 0.2 },
            { title: "إدارة حجوزاتك بسهولة", desc: "تابع حالة طلباتك وعُدّ لجدولك بكل بساطة وسلاسة من لوحة التحكم الخاصة بك.", delay: 0.3 }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
            >
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* قسم التخصصات الطبية */}
      <section className="section-container">
        <div className="section-header">
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
        ) : specialties.length === 0 ? (
          <div className="no-data-box" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <p>لا توجد تخصصات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {specialties.map((spec, index) => (
              <motion.div
                key={spec.id}
                className="card specialty-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
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
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* قسم العيادات */}
      <section className="section-container section-bg-alt">
        <div className="section-header">
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
        ) : clinics.length === 0 ? (
          <div className="no-data-box" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <p>لا توجد عيادات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {clinics.map((clinic, index) => (
              <motion.div
                key={clinic.id}
                className="card clinic-card"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
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
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2.2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;