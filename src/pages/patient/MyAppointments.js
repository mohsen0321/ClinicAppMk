import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import './MyAppointments.css';

const STATUS_LABEL = {
  Pending: 'قيد الانتظار',
  Accepted: 'مؤكد',
  Rejected: 'مرفوض',
  Completed: 'تمت الزيارة',
  Cancelled: 'ملغي',
};

// تاريخ اليوم بتوقيت الجهاز (toISOString بيرجع UTC وممكن يطلع تاريخ امبارح)
const getTodayString = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const formatDate = (value) => new Date(value).toLocaleDateString('ar-EG');
const formatTime = (value) => (value ? value.substring(0, 5) : '');

const StatusBadge = ({ status }) => (
  <span className={`badge-status badge-${String(status).toLowerCase()}`}>
    {STATUS_LABEL[status] || status}
  </span>
);

// نافذة منبثقة موحدة: قفل التمرير، الإغلاق بـ Escape، ونقل التركيز للنافذة
const Modal = ({ title, onClose, tone = 'neutral', wide = false, children }) => {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    if (dialogRef.current) dialogRef.current.focus();
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`modal-card ${tone}${wide ? ' wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // تعديل الموعد
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // تأكيد الإلغاء
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // رسائل النجاح والخطأ
  const [infoModal, setInfoModal] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoadError(false);
      const data = await api.get('/appointments/my-appointments');
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching my appointments:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const retryLoad = () => {
    setLoading(true);
    fetchAppointments();
  };

  // ---------- الإلغاء ----------
  const executeCancel = async () => {
    setCancelling(true);
    try {
      await api.put(`/appointments/${cancelModal.id}/cancel`);
      setCancelModal(null);
      setInfoModal({
        type: 'success',
        title: 'تم إلغاء الحجز',
        message: 'تم إلغاء موعد الكشف وتحديث حالة الحجز.',
      });
      fetchAppointments();
    } catch (err) {
      setCancelModal(null);
      setInfoModal({
        type: 'error',
        title: 'تعذر إلغاء الحجز',
        message: err.message || 'حدث خطأ أثناء محاولة إلغاء الموعد، يرجى المحاولة لاحقاً.',
      });
    } finally {
      setCancelling(false);
    }
  };

  // ---------- التعديل ----------
  const openReschedule = (app) => {
    setRescheduleModal(app);
    setNewDate(app.appointmentDate.split('T')[0]);
    setNewSlot('');
    setRescheduleError('');
  };

  // جلب الفترات المتاحة عند تغيير التاريخ
  useEffect(() => {
    if (!rescheduleModal || !newDate) {
      setAvailableSlots([]);
      return undefined;
    }

    let cancelled = false;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const slots = await api.get(
          `/appointments/available-slots?doctorId=${rescheduleModal.doctorId}&date=${newDate}`
        );
        if (!cancelled) setAvailableSlots(slots || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setAvailableSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => {
      cancelled = true;
    };
  }, [rescheduleModal, newDate]);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newSlot) {
      setRescheduleError('يرجى اختيار التوقيت الجديد من المواعيد المتاحة.');
      return;
    }

    setRescheduling(true);
    setRescheduleError('');
    try {
      await api.put(`/appointments/${rescheduleModal.id}/reschedule`, {
        newDate,
        newTimeSlot: `${newSlot}:00`,
      });
      setRescheduleModal(null);
      setInfoModal({
        type: 'success',
        title: 'تم إرسال طلب التعديل',
        message: 'طلب تعديل الموعد الآن بانتظار تأكيد الإدارة.',
      });
      fetchAppointments();
    } catch (err) {
      setRescheduleError(err.message || 'حدث خطأ أثناء تعديل موعد الحجز.');
    } finally {
      setRescheduling(false);
    }
  };

  const renderSlots = () => {
    if (loadingSlots) {
      return (
        <p className="modal-note">
          <span className="spinner-primary" />
          جاري فحص الأوقات المتاحة...
        </p>
      );
    }
    if (availableSlots.length === 0) {
      return <p className="modal-note warning">لا توجد مواعيد متاحة في هذا اليوم، يرجى اختيار تاريخ آخر.</p>;
    }
    return (
      <div className="slots-grid">
        {availableSlots.map((s) => (
          <button
            type="button"
            key={s}
            className={`slot-chip${newSlot === s ? ' selected' : ''}`}
            aria-pressed={newSlot === s}
            onClick={() => setNewSlot(s)}
          >
            {s}
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="appointments-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="appointment-skeleton-card" />
          ))}
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="empty-state" role="alert">
          <h3>تعذر تحميل الحجوزات</h3>
          <p>حدث خطأ أثناء جلب مواعيدك. تأكد من الاتصال وحاول مرة أخرى.</p>
          <button type="button" className="btn-empty-book" onClick={retryLoad}>
            إعادة المحاولة
          </button>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="empty-state">
          <h3>لا توجد حجوزات مسجلة</h3>
          <p>ليس لديك أي مواعيد حتى الآن. ابحث عن طبيبك واحجز موعدك الأول.</p>
          <Link to="/doctors" className="btn-empty-book">
            تصفح الأطباء واحجز الآن
          </Link>
        </div>
      );
    }

    return (
      <div className="appointments-list">
        {appointments.map((app) => {
          const canModify = app.status !== 'Cancelled' && app.status !== 'Completed';
          return (
            <article key={app.id} className="appointment-card">
              <div className="app-card-header">
                <div className="doctor-title-group">
                  <h3>د. {app.doctorName}</h3>
                  <span className="app-specialty">{app.specialtyName}</span>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <dl className="app-details">
                <div>
                  <dt>العيادة</dt>
                  <dd>
                    {app.clinicName}
                    {app.clinicAddress && <span className="app-address">{app.clinicAddress}</span>}
                  </dd>
                </div>
                <div>
                  <dt>التاريخ</dt>
                  <dd>{formatDate(app.appointmentDate)}</dd>
                </div>
                <div>
                  <dt>الساعة</dt>
                  <dd>{formatTime(app.timeSlot)}</dd>
                </div>
              </dl>

              {app.notes && (
                <p className="app-note">
                  <strong>ملاحظاتك:</strong> {app.notes}
                </p>
              )}

              {app.rejectionReason && (
                <p className="app-note rejection">
                  <strong>سبب الرفض من الإدارة:</strong> {app.rejectionReason}
                </p>
              )}

              {canModify && (
                <div className="app-card-footer">
                  <button type="button" className="btn-action reschedule" onClick={() => openReschedule(app)}>
                    تعديل الموعد
                  </button>
                  <button type="button" className="btn-action cancel" onClick={() => setCancelModal(app)}>
                    إلغاء الحجز
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="my-appointments-container">
      <header className="page-header">
        <h1>حجوزاتي</h1>
        <p>تابع حالة مواعيدك السابقة والقادمة وعدّلها من هنا.</p>
      </header>

      {renderContent()}

      {/* تعديل الموعد */}
      {rescheduleModal && (
        <Modal title="تعديل موعد الحجز" wide onClose={() => setRescheduleModal(null)}>
          <h3 className="modal-title">تعديل موعد الحجز</h3>
          <p className="modal-subtitle">مع د. {rescheduleModal.doctorName}</p>

          <form onSubmit={handleRescheduleSubmit}>
            <div className="form-group-modal">
              <label htmlFor="newDate">التاريخ الجديد</label>
              <input
                id="newDate"
                type="date"
                min={getTodayString()}
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setNewSlot('');
                  setRescheduleError('');
                }}
                required
              />
            </div>

            <div className="form-group-modal" role="group" aria-labelledby="new-slot-label">
              <span id="new-slot-label" className="field-label">
                الوقت الجديد
              </span>
              {renderSlots()}
            </div>

            {rescheduleError && (
              <p className="modal-inline-error" role="alert">
                {rescheduleError}
              </p>
            )}

            <div className="modal-actions-row">
              <button type="submit" className="btn-modal-confirm" disabled={!newSlot || rescheduling}>
                {rescheduling ? 'جاري الحفظ...' : 'حفظ الموعد الجديد'}
              </button>
              <button type="button" className="btn-modal-cancel" onClick={() => setRescheduleModal(null)}>
                إغلاق
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* تأكيد الإلغاء */}
      {cancelModal && (
        <Modal title="تأكيد إلغاء الحجز" tone="error" onClose={() => !cancelling && setCancelModal(null)}>
          <h3 className="modal-title">تأكيد إلغاء الحجز</h3>
          <p className="modal-message">
            هل تريد إلغاء موعدك مع د. {cancelModal.doctorName}؟ لا يمكن التراجع عن هذا الإجراء بعد تأكيده.
          </p>
          <div className="modal-actions-row">
            <button type="button" className="btn-modal-danger" onClick={executeCancel} disabled={cancelling}>
              {cancelling ? 'جاري الإلغاء...' : 'نعم، إلغاء الحجز'}
            </button>
            <button type="button" className="btn-modal-cancel" onClick={() => setCancelModal(null)} disabled={cancelling}>
              تراجع
            </button>
          </div>
        </Modal>
      )}

      {/* رسائل النجاح والخطأ */}
      {infoModal && (
        <Modal title={infoModal.title} tone={infoModal.type} onClose={() => setInfoModal(null)}>
          <h3 className="modal-title">{infoModal.title}</h3>
          <p className="modal-message">{infoModal.message}</p>
          <div className="modal-actions-row">
            <button type="button" className="btn-modal-confirm" onClick={() => setInfoModal(null)} autoFocus>
              حسناً
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyAppointments;