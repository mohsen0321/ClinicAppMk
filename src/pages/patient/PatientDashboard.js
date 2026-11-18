import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, BASE_URL } from '../../services/api';
import clinicimage from '../public/clinicimage.png'; // نفس الصورة المحلية المستخدمة في الصفحة الرئيسية
import './PatientDashboard.css';

const STATUS_LABEL = {
  Pending: 'قيد الانتظار',
  Accepted: 'مقبول',
  Rejected: 'مرفوض',
  Completed: 'مكتمل',
  Cancelled: 'ملغي',
};

// في بطاقة "أقرب موعد" الحالة المقبولة بتظهر "مؤكد"
const UPCOMING_LABEL = { ...STATUS_LABEL, Accepted: 'مؤكد', Pending: 'قيد المراجعة' };

const formatDate = (value) => new Date(value).toLocaleDateString('ar-EG');
const formatTime = (value) => (value ? value.substring(0, 5) : '');

const StatusBadge = ({ status, labels = STATUS_LABEL }) => (
  <span className={`badge-status badge-${String(status).toLowerCase()}`}>
    {labels[status] || status}
  </span>
);

const BannerAvatar = ({ name, pictureUrl }) => {
  const [failed, setFailed] = useState(false);

  if (pictureUrl && !failed) {
    return (
      <img
        src={`${BASE_URL}${pictureUrl}`}
        alt={name}
        className="banner-avatar"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="banner-avatar banner-avatar-placeholder" aria-hidden="true">
      {name ? name.charAt(0).toUpperCase() : 'U'}
    </div>
  );
};

const PatientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await api.get('/dashboard/patient-stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching patient stats:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [reloadKey]);

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

  if (error || !stats) {
    return (
      <div className="patient-dashboard-container">
        <div className="dashboard-error" role="alert">
          <p>تعذر تحميل بيانات لوحة التحكم.</p>
          <button type="button" className="btn-banner-primary" onClick={() => setReloadKey((k) => k + 1)}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { key: 'total', label: 'إجمالي الحجوزات', value: stats.totalAppointments },
    { key: 'pending', label: 'قيد الانتظار', value: stats.pendingAppointments },
    { key: 'accepted', label: 'مقبولة ومؤكدة', value: stats.acceptedAppointments },
    { key: 'rejected', label: 'مرفوضة', value: stats.rejectedAppointments },
  ];

  const upcoming = stats.upcomingAppointment;

  return (
    <div className="patient-dashboard-container">
      {/* الترحيب */}
      <section className="welcome-banner" style={{ backgroundImage: `url(${clinicimage})` }}>
        <div className="welcome-content">
          <div className="welcome-text-group">
            <h2>مرحباً بك، {stats.patientName}</h2>
            <p>تابع جدول حجوزاتك وأدر مواعيدك من مكان واحد.</p>
          </div>
          <div className="banner-actions">
            <Link to="/patient/book" className="btn-banner-primary">
              حجز موعد كشف جديد
            </Link>
            <Link to="/patient/profile" className="btn-banner-secondary">
              تعديل الملف الشخصي
            </Link>
          </div>
        </div>

        <BannerAvatar
          key={stats.profilePictureUrl || 'no-pic'}
          name={stats.patientName}
          pictureUrl={stats.profilePictureUrl}
        />
      </section>

      {/* الإحصائيات */}
      <section className="stats-row" aria-label="ملخص الحجوزات">
        {statCards.map((s) => (
          <div key={s.key} className={`stat-card stat-${s.key}`}>
            <span className="stat-label">{s.label}</span>
            <span className="stat-num">{s.value || 0}</span>
          </div>
        ))}
      </section>

      {/* أقرب موعد */}
      {upcoming && (
        <section className="upcoming-section">
          <h3 className="block-title">أقرب موعد قادم</h3>
          <div className="upcoming-box">
            <div className="upcoming-doctor">
              <h4>د. {upcoming.doctorName}</h4>
              <p>
                {upcoming.specialtyName} · {upcoming.clinicName}
              </p>
            </div>

            <dl className="upcoming-when">
              <div>
                <dt>التاريخ</dt>
                <dd>{formatDate(upcoming.appointmentDate)}</dd>
              </div>
              <div>
                <dt>الساعة</dt>
                <dd>{formatTime(upcoming.timeSlot)}</dd>
              </div>
            </dl>

            <StatusBadge status={upcoming.status} labels={UPCOMING_LABEL} />
          </div>
        </section>
      )}

      {/* أحدث الحجوزات */}
      <section className="recent-appointments-card">
        <div className="card-top-header">
          <h3>أحدث الحجوزات</h3>
          <Link to="/patient/my-appointments" className="view-all-link">
            عرض كل الحجوزات
          </Link>
        </div>

        {stats.recentAppointments && stats.recentAppointments.length > 0 ? (
          <div className="appointments-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th scope="col">الطبيب</th>
                  <th scope="col">التخصص</th>
                  <th scope="col">العيادة</th>
                  <th scope="col">التاريخ والوقت</th>
                  <th scope="col">الحالة</th>
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
                        <span>{formatDate(app.appointmentDate)}</span>
                        <span className="time-sub">({formatTime(app.timeSlot)})</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data-box">
            <p>لا توجد حجوزات مسجلة بعد.</p>
            <Link to="/patient/book" className="view-all-link">
              احجز أول موعد
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default PatientDashboard;