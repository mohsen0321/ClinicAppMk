import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard/admin-stats');
        setStats(data || {});
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="dashboard-skeleton-header" />
        <div className="admin-stats-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="dashboard-skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* هيدر الصفحة */}
      <div className="admin-header">
        <span className="page-badge">لوحة الإدارة المركزية</span>
        <h1>نظرة عامة على النظام والأداء</h1>
        <p>متابعة وتحليل أداء العيادات، الكادر الطبي، وحركة الحجوزات المسجلة لحظياً</p>
      </div>

      {/* صف بطاقات الإحصائيات العامة */}
      <div className="admin-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-icon patients">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="adm-data">
            <span className="adm-num">{stats?.totalPatients || 0}</span>
            <span className="adm-label">إجمالي المرضى المسجلين</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-icon doctors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M12 9v6" />
              <path d="M9 12h6" />
            </svg>
          </div>
          <div className="adm-data">
            <span className="adm-num">{stats?.totalDoctors || 0}</span>
            <span className="adm-label">الأطباء الاستشاريين</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-icon clinics">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
              <path d="M10 11h4M12 9v4" />
            </svg>
          </div>
          <div className="adm-data">
            <span className="adm-num">{stats?.totalClinics || 0}</span>
            <span className="adm-label">العيادات والفروع النشطة</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-icon specialties">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="adm-data">
            <span className="adm-num">{stats?.totalSpecialties || 0}</span>
            <span className="adm-label">التخصصات الطبية</span>
          </div>
        </div>
      </div>

      {/* صف حالات الحجوزات */}
      <div className="admin-stats-grid secondary-grid">
        <div className="adm-stat-card">
          <div className="adm-icon total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="adm-data">
            <span className="adm-num">{stats?.totalAppointments || 0}</span>
            <span className="adm-label">إجمالي الحجوزات الواردة</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-icon pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="adm-data">
            <span className="adm-num">{stats?.pendingAppointments || 0}</span>
            <span className="adm-label">حجوزات بانتظار الموافقة</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-icon accepted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="adm-data">
            <span className="adm-num">{stats?.acceptedAppointments || 0}</span>
            <span className="adm-label">حجوزات مقبولة ومؤكدة</span>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-icon rejected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="adm-data">
            <span className="adm-num">{stats?.rejectedAppointments || 0}</span>
            <span className="adm-label">حجوزات مرفوضة</span>
          </div>
        </div>
      </div>

      {/* أحدث الحجوزات التي وصلت النظام */}
      <div className="admin-table-card">
        <div className="table-top">
          <div className="table-title-group">
            <svg className="table-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
              <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
              <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
            </svg>
            <h3>أحدث الحجوزات الواردة للنظام</h3>
          </div>
          <Link to="/admin/appointments" className="btn-table-action">
            <span>إدارة كافة الحجوزات</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
        </div>

        {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>المريض</th>
                  <th>رقم الهاتف</th>
                  <th>الطبيب المعالج</th>
                  <th>العيادة</th>
                  <th>التاريخ والوقت</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong className="patient-name-text">{app.patientName}</strong>
                    </td>
                    <td>
                      <span dir="ltr" className="phone-text">{app.patientPhone}</span>
                    </td>
                    <td>
                      <div className="doctor-cell-info">
                        <strong>د. {app.doctorName}</strong>
                        <span className="spec-sub">({app.specialtyName})</span>
                      </div>
                    </td>
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
            <p>لا توجد حجوزات مسجلة في النظام بعد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;