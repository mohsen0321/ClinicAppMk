import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './ManageAppointments.css';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  // الفلاتر
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');

  // نافذة سبب الرفض
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // نافذة الإشعارات والنجاح/الخطأ التفاعلية
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: '',
  });

  // نافذة تأكيد الحذف
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    appointmentId: null,
  });

  const fetchFilters = async () => {
    try {
      const [docs, cls] = await Promise.all([
        api.get('/doctors'),
        api.get('/clinics')
      ]);
      setDoctors(docs || []);
      setClinics(cls || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let endpoint = '/appointments/admin-all?';
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (doctorFilter) params.push(`doctorId=${doctorFilter}`);
      if (clinicFilter) params.push(`clinicId=${clinicFilter}`);
      if (dateFilter) params.push(`date=${dateFilter}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);

      endpoint += params.join('&');
      const data = await api.get(endpoint);
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, doctorFilter, clinicFilter, dateFilter, search]);

  // قبول الحجز
  const handleAccept = async (id) => {
    try {
      await api.put(`/appointments/${id}/accept`);
      setInfoModal({
        isOpen: true,
        type: 'success',
        title: 'تم قبول الحجز',
        message: 'تم تأكيد موعد الحجز وإشعار المريض بنجاح.',
      });
      fetchAppointments();
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل العملية',
        message: err.message || 'تعذر قبول الحجز، يرجى المحاولة لاحقاً.',
      });
    }
  };

  // تأكيد الرفض مع السبب
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'تنبيه',
        message: 'يرجى توضيح سبب الرفض للمريض قبل الإرسال.',
      });
      return;
    }

    try {
      await api.put(`/appointments/${rejectModal.id}/reject`, { rejectionReason });
      setRejectModal(null);
      setRejectionReason('');
      setInfoModal({
        isOpen: true,
        type: 'success',
        title: 'تم رفض الطلب',
        message: 'تم تسجيل سبب الرفض وإرساله للمريض بنجاح.',
      });
      fetchAppointments();
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل العملية',
        message: err.message || 'تعذر تسجيل الرفض.',
      });
    }
  };

  // إكمال الحجز بعد الزيارة
  const handleComplete = async (id) => {
    try {
      await api.put(`/appointments/${id}/complete`);
      setInfoModal({
        isOpen: true,
        type: 'success',
        title: 'تم اكتمال الزيارة',
        message: 'تم تحديث حالة الحجز إلى مكتمل بنجاح.',
      });
      fetchAppointments();
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل العملية',
        message: err.message || 'تعذر إكمال الحجز.',
      });
    }
  };

  // تأكيد وحذف الحجز
  const executeDelete = async () => {
    const id = deleteModal.appointmentId;
    setDeleteModal({ isOpen: false, appointmentId: null });
    try {
      await api.delete(`/appointments/${id}`);
      setInfoModal({
        isOpen: true,
        type: 'success',
        title: 'تم الحذف بنجاح',
        message: 'تمت إزالة سجل الحجز من النظام نهائياً.',
      });
      fetchAppointments();
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل الحذف',
        message: err.message || 'تعذر حذف السجل.',
      });
    }
  };

  const hasActiveFilters = Boolean(statusFilter || doctorFilter || clinicFilter || dateFilter || search);

  return (
    <div className="manage-page-container">
      {/* هيدر الصفحة */}
      <div className="admin-header">
        <span className="page-badge">إدارة النظام</span>
        <h1>إدارة حجوزات العيادات</h1>
        <p>مراجعة، وتأكيد، أو رفض حجوزات المرضى والتحكم الكامل في مواعيد المركز</p>
      </div>

      {/* شريط الفلاتر الاحترافي */}
      <div className="admin-filter-bar">
        <div className="filter-input-wrapper search-box">
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="ابحث باسم المريض، هاتفه، أو الطبيب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
        </div>

        <div className="filter-input-wrapper">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input">
            <option value="">جميع الحالات</option>
            <option value="Pending">قيد الانتظار (Pending)</option>
            <option value="Accepted">مقبول (Accepted)</option>
            <option value="Rejected">مرفوض (Rejected)</option>
            <option value="Completed">مكتمل (Completed)</option>
            <option value="Cancelled">ملغي (Cancelled)</option>
          </select>
        </div>

        <div className="filter-input-wrapper">
          <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="admin-input">
            <option value="">جميع الأطباء</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>د. {d.fullName}</option>
            ))}
          </select>
        </div>

        <div className="filter-input-wrapper">
          <select value={clinicFilter} onChange={(e) => setClinicFilter(e.target.value)} className="admin-input">
            <option value="">جميع العيادات</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-input-wrapper">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="admin-input"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setStatusFilter('');
              setDoctorFilter('');
              setClinicFilter('');
              setDateFilter('');
              setSearch('');
            }}
            className="btn-reset"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>إعادة تعيين</span>
          </button>
        )}
      </div>

      {/* جدول الحجوزات */}
      <div className="admin-table-card">
        {loading ? (
          <div className="table-skeleton-container">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="table-skeleton-row" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="no-data-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p>لا توجد حجوزات تطابق خيارات البحث الحالية.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>المريض</th>
                  <th>الهاتف</th>
                  <th>الطبيب والعيادة</th>
                  <th>تاريخ ووقت الكشف</th>
                  <th>ملاحظات المريض</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
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
                        <span className="clinic-sub">{app.clinicName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span>{new Date(app.appointmentDate).toLocaleDateString('ar-EG')}</span>
                        <span className="time-sub">({app.timeSlot.substring(0, 5)})</span>
                      </div>
                    </td>
                    <td>
                      <span className="notes-text">{app.notes || '—'}</span>
                      {app.rejectionReason && (
                        <div className="table-rejection-reason">
                          <strong>سبب الرفض:</strong> {app.rejectionReason}
                        </div>
                      )}
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
                    <td>
                      <div className="table-btn-group">
                        {app.status === 'Pending' && (
                          <>
                            <button onClick={() => handleAccept(app.id)} className="btn-adm-action accept" title="قبول الحجز">
                              قبول
                            </button>
                            <button onClick={() => { setRejectModal(app); setRejectionReason(''); }} className="btn-adm-action reject" title="رفض الحجز">
                              رفض
                            </button>
                          </>
                        )}
                        {app.status === 'Accepted' && (
                          <button onClick={() => handleComplete(app.id)} className="btn-adm-action complete" title="تمت الزيارة">
                            تم الكشف
                          </button>
                        )}
                        <button onClick={() => setDeleteModal({ isOpen: true, appointmentId: app.id })} className="btn-adm-action delete" title="حذف السجل">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
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

      {/* نافذة سبب الرفض (Reject Modal) */}
      {rejectModal && (
        <div className="modal-backdrop" onClick={() => setRejectModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-title">
              <h3>رفض طلب حجز المريض</h3>
              <p>المريض: <strong>{rejectModal.patientName}</strong></p>
            </div>
            <p className="modal-desc">
              يرجى كتابة سبب واضح للرفض (مثل: اعتذار الطبيب، تعارض في المواعيد الطارئة... إلخ) ليتم إرساله للمريض.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group-modal">
                <textarea
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب سبب الرفض هنا..."
                  required
                />
              </div>
              <div className="modal-actions-row">
                <button type="submit" className="btn-modal-danger">
                  تأكيد الرفض وإشعار المريض
                </button>
                <button type="button" className="btn-modal-cancel" onClick={() => setRejectModal(null)}>
                  تراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف (Delete Confirmation Modal) */}
      {deleteModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setDeleteModal({ isOpen: false, appointmentId: null })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="modal-title">تأكيد حذف السجل</h3>
            <p className="modal-message">
              هل أنت متأكد من رغبتك في حذف هذا السجل من النظام نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="modal-actions-row" style={{ width: '100%' }}>
              <button type="button" className="btn-modal-danger" onClick={executeDelete}>
                نعم، احذف نهائياً
              </button>
              <button type="button" className="btn-modal-cancel" onClick={() => setDeleteModal({ isOpen: false, appointmentId: null })}>
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإشعارات التفاعلية (Info Modal) */}
      {infoModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setInfoModal((prev) => ({ ...prev, isOpen: false }))}>
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

export default ManageAppointments;