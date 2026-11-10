import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import './MyAppointments.css';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // لحالة تعديل موعد حجز
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // نافذة تأكيد إلغاء الحجز (Popup)
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    appointmentId: null,
    doctorName: '',
  });

  // نافذة الإشعارات والنجاح/الخطأ التفاعلية (Info Popup)
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: '',
  });

  const fetchAppointments = async () => {
    try {
      const data = await api.get('/appointments/my-appointments');
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching my appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // فتح نافذة تأكيد الإلغاء
  const openCancelModal = (app) => {
    setCancelModal({
      isOpen: true,
      appointmentId: app.id,
      doctorName: app.doctorName,
    });
  };

  // تنفيذ إلغاء الحجز بعد التأكيد
  const executeCancel = async () => {
    const id = cancelModal.appointmentId;
    setCancelModal({ isOpen: false, appointmentId: null, doctorName: '' });

    try {
      await api.put(`/appointments/${id}/cancel`);
      setInfoModal({
        isOpen: true,
        type: 'success',
        title: 'تم إلغاء الحجز بنجاح',
        message: 'تم إلغاء موعد الكشف الطبي المحدد وتحديث حالة الحجز.',
      });
      fetchAppointments();
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل إلغاء الحجز',
        message: err.message || 'حدث خطأ أثناء محاولة إلغاء الموعد، يرجى المحاولة لاحقاً.',
      });
    }
  };

  // جلب الفترات المتاحة عند تعديل الموعد
  useEffect(() => {
    const fetchSlots = async () => {
      if (!rescheduleModal || !newDate) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const slots = await api.get(`/appointments/available-slots?doctorId=${rescheduleModal.doctorId}&date=${newDate}`);
        setAvailableSlots(slots || []);
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [rescheduleModal, newDate]);

  // إرسال طلب التعديل
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newSlot) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'تنبيه',
        message: 'يرجى اختيار التوقيت الجديد من المواعيد المتاحة.',
      });
      return;
    }

    try {
      await api.put(`/appointments/${rescheduleModal.id}/reschedule`, {
        newDate: newDate,
        newTimeSlot: `${newSlot}:00`,
      });
      setRescheduleModal(null);
      setInfoModal({
        isOpen: true,
        type: 'success',
        title: 'تم طلب التعديل بنجاح',
        message: 'تم إرسال طلب تعديل الموعد وهو الآن بانتظار تأكيد الإدارة.',
      });
      fetchAppointments();
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل تعديل الموعد',
        message: err.message || 'حدث خطأ أثناء تعديل موعد الحجز.',
      });
    }
  };

  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="my-appointments-container">
      {/* هيدر الصفحة */}
      <div className="page-header">
        <span className="page-badge">سجل المواعيد</span>
        <h1>سجل حجوزاتي الطبية</h1>
        <p>متابعة وتحديث حالة جميع مواعيدك السابقة والقادمة بكل سهولة</p>
      </div>

      {loading ? (
        <div className="appointments-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="appointment-skeleton-card" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3>لا توجد حجوزات مسجلة</h3>
          <p>ليس لديك أي مواعيد مسجلة حتى الآن. ابحث عن طبيبك المفضّل واحجز موعدك الأول.</p>
          <Link to="/doctors" className="btn-empty-book">
            تصفح الأطباء واحجز الآن
          </Link>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((app) => (
            <div key={app.id} className="appointment-card">
              <div className="app-card-header">
                <div className="doctor-title-group">
                  <h3>د. {app.doctorName}</h3>
                  <span className="app-specialty">{app.specialtyName}</span>
                </div>
                <span className={`badge-status badge-${app.status.toLowerCase()}`}>
                  <span className="badge-dot" />
                  {app.status === 'Pending' && 'قيد الانتظار'}
                  {app.status === 'Accepted' && 'مؤكد'}
                  {app.status === 'Rejected' && 'مرفوض'}
                  {app.status === 'Completed' && 'تمت الزيارة'}
                  {app.status === 'Cancelled' && 'ملغي'}
                </span>
              </div>

              <div className="app-card-body">
                <div className="app-meta-row">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
                  </svg>
                  <span><strong>العيادة:</strong> {app.clinicName} ({app.clinicAddress})</span>
                </div>

                <div className="app-meta-row">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    <strong>التاريخ:</strong> {new Date(app.appointmentDate).toLocaleDateString('ar-EG')} — الساعة: <strong>{app.timeSlot.substring(0, 5)}</strong>
                  </span>
                </div>

                {app.notes && (
                  <div className="app-notes-box">
                    <strong>ملاحظاتك:</strong> {app.notes}
                  </div>
                )}

                {app.rejectionReason && (
                  <div className="rejection-box">
                    <strong>سبب الرفض من الإدارة:</strong> {app.rejectionReason}
                  </div>
                )}
              </div>

              <div className="app-card-footer">
                {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                  <>
                    <button
                      type="button"
                      className="btn-action reschedule"
                      onClick={() => {
                        setRescheduleModal(app);
                        setNewDate(app.appointmentDate.split('T')[0]);
                        setNewSlot('');
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      <span>تعديل الموعد</span>
                    </button>
                    <button
                      type="button"
                      className="btn-action cancel"
                      onClick={() => openCancelModal(app)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>إلغاء الحجز</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة تعديل الموعد (Reschedule Modal) */}
      {rescheduleModal && (
        <div className="modal-backdrop" onClick={() => setRescheduleModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-title">
              <h3>تعديل موعد الحجز</h3>
              <p>مع د. {rescheduleModal.doctorName}</p>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="form-group-modal">
                <label>اختر التاريخ الجديد:</label>
                <input
                  type="date"
                  min={todayString}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-modal">
                <label>اختر الوقت الجديد المتاح:</label>
                {loadingSlots ? (
                  <div className="modal-loading-slots">
                    <span className="spinner-primary" />
                    <span>جاري فحص الأوقات المتاحة...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="no-slots-alert">لا توجد مواعيد متاحة في هذا اليوم، يرجى اختيار تاريخ آخر.</div>
                ) : (
                  <div className="slots-grid">
                    {availableSlots.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`slot-chip ${newSlot === s ? 'selected' : ''}`}
                        onClick={() => setNewSlot(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="btn-modal-confirm" disabled={!newSlot}>
                  حفظ الموعد الجديد
                </button>
                <button type="button" className="btn-modal-cancel" onClick={() => setRescheduleModal(null)}>
                  إغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الإلغاء (Cancel Confirmation Popup) */}
      {cancelModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setCancelModal({ isOpen: false, appointmentId: null, doctorName: '' })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="modal-title">تأكيد إلغاء الحجز</h3>
            <p className="modal-message">
              هل أنت متأكد من رغبتك في إلغاء موعدك مع د. {cancelModal.doctorName}؟ لا يمكن التراجع عن هذا الإجراء بعد تأكيده.
            </p>
            <div className="modal-actions-row" style={{ width: '100%' }}>
              <button type="button" className="btn-modal-danger" onClick={executeCancel}>
                نعم، إلغاء الحجز
              </button>
              <button type="button" className="btn-modal-cancel" onClick={() => setCancelModal({ isOpen: false, appointmentId: null, doctorName: '' })}>
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإشعارات والنجاح/الخطأ العامة (Info Popup) */}
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

export default MyAppointments;