import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, BASE_URL } from '../../services/api';
import './Doctors.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialtyId') || '');
  const [selectedClinic, setSelectedClinic] = useState(searchParams.get('clinicId') || '');

  // جلب الفلاتر (التخصصات والعيادات)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [specs, cls] = await Promise.all([
          api.get('/specialties'),
          api.get('/clinics')
        ]);
        setSpecialties(specs || []);
        setClinics(cls || []);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };
    fetchFilters();
  }, []);

  // جلب الأطباء بناءً على الفلاتر
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        let endpoint = '/doctors?';
        const params = [];
        if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
        if (selectedSpecialty) params.push(`specialtyId=${selectedSpecialty}`);
        if (selectedClinic) params.push(`clinicId=${selectedClinic}`);
        endpoint += params.join('&');
        const data = await api.get(endpoint);
        setDoctors(data || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [searchTerm, selectedSpecialty, selectedClinic]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedClinic('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(searchTerm || selectedSpecialty || selectedClinic);

  return (
    <div className="doctors-page-container">
      {/* الهيدر الرئيسي */}
      <div className="page-header">
        <span className="page-badge">الكادر الطبي المميز</span>
        <h1>نخبة الأطباء والاستشاريين</h1>
        <p>ابحث عن طبيبك المفضل واحجز موعدك بكل سهولة وأمان</p>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="filter-card">
        <div className="filter-grid">
          {/* حقل البحث باسم الطبيب */}
          <div className="filter-input-group">
            <label htmlFor="search-doctor">البحث باسم الطبيب</label>
            <div className="input-with-icon">
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="search-doctor"
                type="text"
                placeholder="اكتب اسم الطبيب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* التخصص الطبي */}
          <div className="filter-input-group">
            <label htmlFor="select-specialty">التخصص الطبي</label>
            <div className="input-with-icon">
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <select
                id="select-specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="">جميع التخصصات</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* العيادة */}
          <div className="filter-input-group">
            <label htmlFor="select-clinic">العيادة</label>
            <div className="input-with-icon">
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
              </svg>
              <select
                id="select-clinic"
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
              >
                <option value="">جميع العيادات</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* زر إعادة الضبط */}
          {hasActiveFilters && (
            <div className="filter-action-group">
              <button type="button" className="btn-reset-filter" onClick={handleReset}>
                <svg className="reset-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>إلغاء الفلاتر</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* قائمة الأطباء */}
      {loading ? (
        <div className="doctors-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="doctor-skeleton-card" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
          <h3>لم نجد أي نتائج مطابقة</h3>
          <p>لم نجد أي طبيب يطابق معايير البحث الحالية، جرب تغيير الفلاتر أو إعادة كتابة اسم البحث.</p>
          {hasActiveFilters && (
            <button type="button" className="btn-empty-reset" onClick={handleReset}>
              عرض جميع الأطباء
            </button>
          )}
        </div>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doc) => (
            <div key={doc.id} className="doctor-card">
              <div className="doctor-card-header">
                <div className="doctor-img-container">
                  <img
                    src={doc.profilePictureUrl ? `${BASE_URL}${doc.profilePictureUrl}` : 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'}
                    alt={doc.fullName}
                    className="doctor-img"
                    onError={(e) => {
                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png';
                    }}
                  />
                </div>
                <span className="doc-specialty-badge">{doc.specialtyName}</span>
              </div>

              <div className="doctor-info">
                <h3 className="doctor-name">{doc.fullName}</h3>

                <div className="doc-meta-item">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{doc.clinicName}</span>
                </div>

                <p className="doc-bio">
                  {doc.biography || 'استشاري متخصص يمتلك خبرة واسعة في التشخيص وتقديم أفضل رعاية طبية للمرضى.'}
                </p>

                <div className="doc-meta-item duration-item">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>مدة الكشف: <strong>{doc.appointmentDurationMinutes} دقيقة</strong></span>
                </div>

                <div className="doc-actions">
                  <Link to={`/doctors/${doc.id}`} className="btn-doc-details">
                    المواعيد والتفاصيل
                  </Link>
                  <Link to={`/patient/book?doctorId=${doc.id}`} className="btn-doc-book">
                    احجز الآن
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;