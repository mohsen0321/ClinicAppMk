import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import './Home.css';
import clinicimage from './clinicimage.png'; // عدل المسار حسب مكان الصورة الفعلي عندك

const FEATURES = [
  {
    title: 'حجز فوري ومؤكد',
    desc: 'اختر الطبيب والوقت المتاح الذي يناسبك بدون انتظار أو عناء في العيادة.',
  },
  {
    title: 'أفضل الأطباء',
    desc: 'نخبة من الاستشاريين والأخصائيين في كافة التخصصات بأعلى درجات الكفاءة.',
  },
  {
    title: 'إدارة حجوزاتك بسهولة',
    desc: 'تابع حالة طلباتك وعُدّ لجدولك بكل بساطة من لوحة التحكم الخاصة بك.',
  },
];

// صيغة عدد الأطباء بشكل سليم لغوياً
const doctorsLabel = (n = 0) => {
  if (n === 0) return 'لا يوجد أطباء حالياً';
  if (n === 1) return 'طبيب واحد';
  if (n === 2) return 'طبيبان';
  if (n <= 10) return `${n} أطباء`;
  return `${n} طبيبًا`;
};

const ArrowIcon = () => (
  <svg
    className="link-arrow"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

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
          api.get('/clinics'),
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
        setError('تعذر تحميل بيانات المنصة، يجب التأكد من تشغيل السيرفر والاتصال بالخادم.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* قسم الترحيب */}
      <section className="hero-section" style={{ backgroundImage: `url(${clinicimage})` }}>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">صحتك ورعايتك تبدأ من هنا</h1>
            <p className="hero-subtitle">
              احجز موعدك مع نخبة من الأطباء والاستشاريين في أفضل العيادات والمراكز التخصصية بخطوات
              سهلة ومباشرة.
            </p>
            <div className="hero-actions">
              <Link to="/doctors" className="btn-hero-primary">
                تصفح الأطباء واحجز الآن
              </Link>
              <Link to="/clinics" className="btn-hero-secondary">
                عرض العيادات المتاحة
              </Link>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="section-inner">
          <div className="home-error" role="alert">
            {error}
          </div>
        </div>
      )}

      {/* المميزات */}
      <section className="features-section">
        <div className="section-inner features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* التخصصات */}
      <section className="section-container">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2>التخصصات الطبية</h2>
              <p>اختر التخصص الذي ترغب في استشارته للوصول للأطباء المعتمدين.</p>
            </div>
            <Link to="/doctors" className="section-more">
              عرض كل الأطباء
            </Link>
          </div>

          {loading ? (
            <div className="grid-cards">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-card" />
              ))}
            </div>
          ) : specialties.length === 0 ? (
            <p className="no-data">لا توجد تخصصات متاحة حالياً.</p>
          ) : (
            <div className="grid-cards">
              {specialties.map((spec) => (
                <article key={spec.id} className="card specialty-card">
                  <div className="card-header">
                    <h3>{spec.name}</h3>
                    <span className="badge">{doctorsLabel(spec.doctorsCount)}</span>
                  </div>
                  <p className="card-description">
                    {spec.description || 'رعاية متكاملة وفق أحدث المعايير الطبية المعتمدة.'}
                  </p>
                  <Link to={`/doctors?specialtyId=${spec.id}`} className="card-link">
                    <span>عرض الأطباء</span>
                    <ArrowIcon />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* العيادات */}
      <section className="section-container section-bg-alt">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2>عياداتنا ومراكزنا</h2>
              <p>عيادات مجهزة بأحدث التقنيات والمعدات الطبية لخدمتكم.</p>
            </div>
            <Link to="/clinics" className="section-more">
              عرض كل العيادات
            </Link>
          </div>

          {loading ? (
            <div className="grid-cards">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-card" />
              ))}
            </div>
          ) : clinics.length === 0 ? (
            <p className="no-data">لا توجد عيادات متاحة حالياً.</p>
          ) : (
            <div className="grid-cards">
              {clinics.map((clinic) => (
                <article key={clinic.id} className="card clinic-card">
                  <h3>{clinic.name}</h3>
                  <div className="clinic-details">
                    <div className="clinic-detail-item">
                      <svg
                        className="detail-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{clinic.address}</span>
                    </div>
                    <div className="clinic-detail-item">
                      <svg
                        className="detail-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2.2 2.2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span dir="ltr">{clinic.phoneNumber}</span>
                    </div>
                  </div>
                  <Link to={`/doctors?clinicId=${clinic.id}`} className="card-link">
                    <span>أطباء العيادة</span>
                    <ArrowIcon />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;