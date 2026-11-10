import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, BASE_URL } from '../../services/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './DoctorDetails.css';

const daysArabic = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تفعيل الأنيميشن الخفيف لصفحة تفاصيل الطبيب
    AOS.init({
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
    });

    const fetchDoctor = async () => {
      try {
        const data = await api.get(`/doctors/${id}`);
        setDoctor(data);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="doc-details-container">
        <div className="details-skeleton-card" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doc-details-container">
        <div className="doc-empty-card" data-aos="zoom-in">
          <h2>الطبيب غير موجود</h2>
          <p>عذراً، تعذر العثور على بيانات الطبيب المطلوبة أو تم حذف الحساب.</p>
          <Link to="/doctors" className="btn-back-doctors">
            العودة لقائمة الأطباء
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-details-container">
      {/* بطاقة البروفايل الرئيسية */}
      <div className="doc-profile-header" data-aos="fade-down">
        <div className="doc-profile-avatar-wrapper" data-aos="zoom-in" data-aos-delay="100">
          <img
            src={doctor.profilePictureUrl ? `${BASE_URL}${doctor.profilePictureUrl}` : 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'}
            alt={doctor.fullName}
            className="doc-profile-img"
            onError={(e) => {
              e.target.src = 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png';
            }}
          />
        </div>

        <div className="doc-profile-text" data-aos="fade-right" data-aos-delay="150">
          <span className="badge-specialty">{doctor.specialtyName}</span>
          <h1>{doctor.fullName}</h1>

          <div className="doc-meta-row">
            <div className="doc-meta-badge">
              <svg className="doc-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
              </svg>
              <span>العيادة: <strong>{doctor.clinicName}</strong></span>
            </div>

            {doctor.phoneNumber && (
              <div className="doc-meta-badge">
                <svg className="doc-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>رقم التواصل: <strong dir="ltr">{doctor.phoneNumber}</strong></span>
              </div>
            )}
          </div>

          <Link to={`/patient/book?doctorId=${doctor.id}`} className="btn-book-now">
            <svg className="btn-book-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>احجز موعداً مع الطبيب الآن</span>
          </Link>
        </div>
      </div>

      {/* شبكة التفاصيل */}
      <div className="doc-details-grid">
        {/* النبذة التعريفية */}
        <div className="details-card" data-aos="fade-up" data-aos-delay="200">
          <div className="details-card-header">
            <svg className="section-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h2>نبذة تعريفية عن الطبيب</h2>
          </div>
          
          <p className="bio-text">
            {doctor.biography || 'استشاري متخصص ذو خبرة علمية وعملية واسعة في تقديم الاستشارات الطبية والتشخيص الدقيق.'}
          </p>

          <div className="consultation-info-box">
            <svg className="info-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>مدة الكشف المقررة: <strong>{doctor.appointmentDurationMinutes} دقيقة</strong></span>
          </div>
        </div>

        {/* ساعات العمل */}
        <div className="details-card" data-aos="fade-up" data-aos-delay="300">
          <div className="details-card-header">
            <svg className="section-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h2>جدول مواعيد وساعات العمل الأسبوعية</h2>
          </div>

          {doctor.workingHours && doctor.workingHours.length > 0 ? (
            <div className="working-hours-table">
              {doctor.workingHours.map((wh, idx) => (
                <div key={idx} className="working-hour-row" data-aos="fade-in" data-aos-delay={idx * 50}>
                  <span className="day-name">{daysArabic[wh.dayOfWeek]}</span>
                  {wh.isAvailable ? (
                    <span className="time-badge">
                      من {wh.startTime ? wh.startTime.substring(0, 5) : ''} إلى {wh.endTime ? wh.endTime.substring(0, 5) : ''}
                    </span>
                  ) : (
                    <span className="holiday-badge">عطلة رسمية</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-hours-box">
              <p>لم يتم تسجيل ساعات عمل محددة بعد، يرجى التواصل المباشر مع العيادة للحجز والاستفسار.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;