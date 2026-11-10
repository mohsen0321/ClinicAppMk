import React, { useEffect, useState } from 'react';
import { api, BASE_URL } from '../../services/api';
import './ManagePatients.css';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // نافذة عرض سجل المريض
  const [historyModal, setHistoryModal] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // نافذة الإشعارات التفاعلية (Z-index: 3000 لتعلو فوق الجميع)
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: '',
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const endpoint = search ? `/patients?search=${encodeURIComponent(search)}` : '/patients';
      const data = await api.get(endpoint);
      setPatients(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const showPopup = (type, title, message) => {
    setInfoModal({ isOpen: true, type, title, message });
  };

  // فتح سجل حجوزات مريض محدد
  const handleViewHistory = async (patientId) => {
    setLoadingHistory(true);
    try {
      const details = await api.get(`/patients/${patientId}`);
      setHistoryModal(details);
    } catch (err) {
      showPopup('error', 'فشل الجلب', 'تعذر تحميل سجل حجوزات المريض حالياً.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // تعطيل / تفعيل حساب مريض
  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/patients/${id}/toggle-status`);
      showPopup('success', 'تحديث حالة الحساب', res.message || 'تم تحديث حالة حساب المريض بنجاح.');
      fetchPatients();
    } catch (err) {
      showPopup('error', 'فشل العملية', err.message || 'تعذر تغيير حالة حساب المريض.');
    }
  };

  return (
    <div className="manage-page-container">
      {/* هيدر الصفحة */}
      <div className="admin-header">
        <span className="page-badge">سجلات المرضى</span>
        <h1>إدارة وسجل المرضى</h1>
        <p>استعراض بيانات المرضى المسجلين، متابعة سجلات حجوزاتهم، والتحكم في حالة الحسابات</p>
      </div>

      {/* شريط البحث */}
      <div className="admin-filter-bar">
        <div className="filter-input-wrapper search-box">
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="ابحث باسم المريض، رقم الهاتف، أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input search-input"
          />
        </div>

        {search && (
          <button type="button" onClick={() => setSearch('')} className="btn-reset">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>مسح البحث</span>
          </button>
        )}
      </div>

      {/* جدول المرضى */}
      <div className="admin-table-card">
        {loading ? (
          <div className="table-skeleton-container">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="table-skeleton-row" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="no-data-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>لا يوجد مرضى مطابقين لخيارات البحث الحالية.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>المريض</th>
                  <th>رقم الهاتف</th>
                  <th>الجنس</th>
                  <th>العنوان</th>
                  <th>إجمالي الحجوزات</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="patient-name-cell">
                        <img
                          src={p.profilePictureUrl ? `${BASE_URL}${p.profilePictureUrl}` : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                          alt={p.fullName}
                          className="patient-thumb"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <div>
                          <strong className="patient-title-text">{p.fullName}</strong>
                          <div className="patient-email-sub">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span dir="ltr" className="phone-text">{p.phoneNumber}</span>
                    </td>
                    <td>
                      <span className="gender-tag">
                        {p.gender === 'Male' ? 'ذكر' : p.gender === 'Female' ? 'أنثى' : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="address-text">{p.address || '—'}</span>
                    </td>
                    <td>
                      <span className="badge-count">{p.totalAppointments || 0} حجز</span>
                    </td>
                    <td>
                      <span className={`badge-status ${p.isActive ? 'badge-accepted' : 'badge-rejected'}`}>
                        <span className="badge-dot" />
                        {p.isActive ? 'مفعل' : 'معطل'}
                      </span>
                    </td>
                    <td>
                      <div className="table-btn-group">
                        <button
                          type="button"
                          onClick={() => handleViewHistory(p.id)}
                          className="btn-adm-action complete"
                          title="عرض سجل الحجوزات"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                          <span>سجل الحجوزات</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id)}
                          className={`btn-adm-action ${p.isActive ? 'reject' : 'accept'}`}
                          title={p.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          {p.isActive ? 'تعطيل' : 'تفعيل'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة سجل حجوزات المريض (Z-index: 2000) */}
      {historyModal && (
        <div className="modal-backdrop" onClick={() => setHistoryModal(null)}>
          <div className="modal-box modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-title">
              <h3>سجل حجوزات المريض: {historyModal.fullName}</h3>
              <div className="history-patient-contact">
                <span>📞 <strong dir="ltr">{historyModal.phoneNumber}</strong></span>
                <span className="divider-dot">•</span>
                <span>📧 {historyModal.email}</span>
              </div>
            </div>

            {historyModal.appointments && historyModal.appointments.length > 0 ? (
              <div className="table-responsive history-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>الطبيب والعيادة</th>
                      <th>التاريخ والوقت</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyModal.appointments.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className="history-doc-info">
                            <strong>د. {a.doctorName}</strong>
                            <span className="history-sub-text">({a.specialtyName}) — {a.clinicName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <span>{new Date(a.appointmentDate).toLocaleDateString('ar-EG')}</span>
                            <span className="time-sub">({a.timeSlot.substring(0, 5)})</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status badge-${a.status.toLowerCase()}`}>
                            <span className="badge-dot" />
                            {a.status === 'Pending' && 'قيد الانتظار'}
                            {a.status === 'Accepted' && 'مقبول'}
                            {a.status === 'Rejected' && 'مرفوض'}
                            {a.status === 'Completed' && 'مكتمل'}
                            {a.status === 'Cancelled' && 'ملغي'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data-box history-empty">
                <p>لا توجد أي حجوزات مسجلة لهذا المريض حتى الآن.</p>
              </div>
            )}

            <div className="modal-actions-row" style={{ marginTop: '1.5rem', justifyContent: 'flex-start' }}>
              <button type="button" onClick={() => setHistoryModal(null)} className="btn-modal-cancel">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإشعارات التفاعلية (Z-index: 3000) */}
      {infoModal.isOpen && (
        <div className="info-popup-backdrop" onClick={() => setInfoModal((prev) => ({ ...prev, isOpen: false }))}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon-wrapper ${infoModal.type}`}>
              {infoModal.type === 'success' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>

            <h3 className="modal-title">{infoModal.title}</h3>
            <p className="modal-message">{infoModal.message}</p>

            <button
              type="button"
              className={`btn-modal-close ${infoModal.type}`}
              onClick={() => setInfoModal((prev) => ({ ...prev, isOpen: false }))}
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePatients;