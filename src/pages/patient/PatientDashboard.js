import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, BASE_URL } from '../../services/api';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard/patient-stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching patient stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="patient-dashboard-container">
        <div className="dashboard-skeleton-banner" />
        <div className="dashboard-skeleton-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="dashboard-skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard-container">
      {/* بطاقة الترحيب العلوية */}
      <div className="welcome-banner">
        <div className="welcome-backdrop-glow" />
        <div className="welcome-content">
          <div className="welcome-text-group">
            <span className="welcome-greeting-badge">
              <span className="online-dot" />
              أهلاً بك مجدداً
            </span>
            <h2>مرحباً بك، {stats?.patientName}</h2>
            <p>نتمنى لك دوام الصحة والعافية. يمكنك متابعة جدول حجوزاتك وإدارة مواعيدك بكل بساطة وسلاسة.</p>
          </div>
          <div className="banner-actions">
            <Link to="/patient/book" className="btn-banner-primary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" />
                <line x1="10" y1="16" x2="14" y2="16" />
              </svg>
              <span>حجز موعد كشف جديد</span>
            </Link>
            <Link to="/patient/profile" className="btn-banner-secondary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>تعديل الملف الشخصي</span>
            </Link>
          </div>
        </div>

        {stats?.profilePictureUrl ? (
          <div className="banner-avatar-wrapper">
            <img
              src={`${BASE_URL}${stats.profilePictureUrl}`}
              alt={stats.patientName}
              className="banner-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="banner-avatar-placeholder">
            <span>{stats?.patientName ? stats.patientName.charAt(0).toUpperCase() : 'U'}</span>
          </div>
        )}
      </div>

      {/* بطاقات الإحصائيات الأربعة */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon total">
            <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>

              <line x1="7" y1="14" x2="11" y2="14"></line>
              <line x1="7" y1="17" x2="14" y2="17"></line>
              <circle cx="15" cy="14" r="1" fill="currentColor"></circle>
            </svg>
          </div>
          <div className="stat-data">
            <span className="stat-num">{stats?.totalAppointments || 0}</span>
            <span className="stat-label">إجمالي الحجوزات</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <circle cx="12" cy="15" r="3"></circle>
              <polyline points="12 13.5 12 15 13.5 15"></polyline>
            </svg>
          </div>
          <div className="stat-data">
            <span className="stat-num">{stats?.pendingAppointments || 0}</span>
            <span className="stat-label">حجوزات قيد الانتظار</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accepted">
            <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <circle cx="12" cy="15" r="3.5" fill="currentColor" opacity="0.15"></circle>
              <path d="M9.5 15l1.5 1.5 3.5-3.5" stroke-width="2.5"></path>
            </svg>
          </div>
          <div className="stat-data">
            <span className="stat-num">{stats?.acceptedAppointments || 0}</span>
            <span className="stat-label">حجوزات مقبولة ومؤكدة</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rejected">
            <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <circle cx="12" cy="15" r="3.5" fill="currentColor" opacity="0.15"></circle>
              <line x1="10" y1="13" x2="14" y2="17" stroke-width="2.5"></line>
              <line x1="14" y1="13" x2="10" y2="17" stroke-width="2.5"></line>
            </svg>
          </div>
          <div className="stat-data">
            <span className="stat-num">{stats?.rejectedAppointments || 0}</span>
            <span className="stat-label">حجوزات مرفوضة</span>
          </div>
        </div>
      </div>

      {/* أقرب موعد قادم */}
      {stats?.upcomingAppointment && (
        <div className="upcoming-section">
          <div className="section-title-wrapper">
            <svg className="section-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3>أقرب موعد قادم لك</h3>
          </div>

          <div className="upcoming-box">
            <div className="upcoming-main-info">
              <div className="upcoming-doc-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  <path d="M12 9v6" />
                  <path d="M9 12h6" />
                </svg>
              </div>
              <div className="upcoming-details">
                <h4>د. {stats.upcomingAppointment.doctorName}</h4>
                <div className="upcoming-meta-tags">
                  <span className="tag-item">{stats.upcomingAppointment.specialtyName}</span>
                  <span className="tag-dot">•</span>
                  <span className="tag-item">{stats.upcomingAppointment.clinicName}</span>
                </div>
                <div className="upcoming-time-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    التاريخ: {new Date(stats.upcomingAppointment.appointmentDate).toLocaleDateString('ar-EG')} - الساعة: {stats.upcomingAppointment.timeSlot.substring(0, 5)}
                  </span>
                </div>
              </div>
            </div>

            <div className="upcoming-status-side">
              <span className={`status-pill status-${stats.upcomingAppointment.status.toLowerCase()}`}>
                <span className="status-indicator-dot" />
                {stats.upcomingAppointment.status === 'Accepted' ? 'مؤكد' : 'قيد المراجعة'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* أحدث الحجوزات */}
      <div className="recent-appointments-card">
        <div className="card-top-header">
          <div className="header-title-group">
            <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
              <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
              <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
            </svg>
            <h3>أحدث الحجوزات</h3>
          </div>
          <Link to="/patient/my-appointments" className="view-all-link">
            <span>عرض كل الحجوزات</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
        </div>

        {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
          <div className="appointments-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>الطبيب</th>
                  <th>التخصص</th>
                  <th>العيادة</th>
                  <th>التاريخ والوقت</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.map((app) => (
                  <tr key={app.id}>
                    <td className="doc-name-cell">
                      <strong>د. {app.doctorName}</strong>
                    </td>
                    <td>{app.specialtyName}</td>
                    <td>{app.clinicName}</td>
                    <td>
                      <div className="date-cell">
                        <span>{new Date(app.appointmentDate).toLocaleDateString('ar-EG')}</span>
                        <span className="time-sub">({app.timeSlot.substring(0, 5)})</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status badge-${app.status.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {app.status === 'Pending' && 'قيد الانتظار'}
                        {app.status === 'Accepted' && 'مقبول'}
                        {app.status === 'Rejected' && 'مرفوض'}
                        {app.status === 'Completed' && 'مكتمل'}
                        {app.status === 'Cancelled' && 'ملغي'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p>لا توجد حجوزات مسجلة بعد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;