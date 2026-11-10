import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, BASE_URL } from '../../services/api';
import './Clinics.css';

const Clinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await api.get('/clinics');
        setClinics(data || []);
      } catch (err) {
        console.error('Error fetching clinics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  return (
    <div className="clinics-page-container">
      {/* الهيدر الرئيسي للصفحة */}
      <div className="page-header">
        <span className="page-badge">شبكة الفروع المعتمدة</span>
        <h1>عياداتنا ومراكزنا المتخصصة</h1>
        <p>نعمل في فروع وعيادات مجهزة بأحدث التقنيات والمعدات الطبية لخدمتكم</p>
      </div>

      {/* قائمة العيادات أو حالات التحميل */}
      {loading ? (
        <div className="clinics-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="clinic-skeleton-card" />
          ))}
        </div>
      ) : clinics.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
            </svg>
          </div>
          <h3>لا تتوفر عيادات حالياً</h3>
          <p>لم يتم العثور على أي مراكز أو عيادات في الوقت الحالي، يرجى المحاولة لاحقاً.</p>
        </div>
      ) : (
        <div className="clinics-grid">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="clinic-full-card">
              <div className="clinic-cover-wrapper">
                {clinic.imageUrl ? (
                  <img
                    src={`${BASE_URL}${clinic.imageUrl}`}
                    alt={clinic.name}
                    className="clinic-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="clinic-cover-placeholder"
                  style={{ display: clinic.imageUrl ? 'none' : 'flex' }}
                >
                  <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
                    <path d="M12 11v6M9 14h6" />
                  </svg>
                </div>
                <span className="doctors-count-tag">
                  {clinic.doctorsCount ?? 0} أطباء متاحين
                </span>
              </div>

              <div className="clinic-card-content">
                <h3 className="clinic-title">{clinic.name}</h3>
                <p className="clinic-desc">
                  {clinic.description || 'مركز طبي متكامل يقدم أعلى مستويات الرعاية الصحية والتخصصات الطبية.'}
                </p>

                <div className="clinic-details-meta">
                  <div className="meta-item">
                    <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{clinic.address}</span>
                  </div>
                  {clinic.phoneNumber && (
                    <div className="meta-item">
                      <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span dir="ltr">{clinic.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <Link to={`/doctors?clinicId=${clinic.id}`} className="btn-clinic-doctors">
                  <span>عرض أطباء هذه العيادة</span>
                  <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clinics;