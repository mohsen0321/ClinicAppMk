import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import './BookAppointment.css';

// تاريخ اليوم بتوقيت الجهاز (toISOString بيرجع UTC وممكن يطلع تاريخ امبارح)
const getTodayString = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const BookAppointment = () => {
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [myExistingAppointments, setMyExistingAppointments] = useState([]);

  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [notes, setNotes] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId');
  const redirectTimer = useRef(null);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  // جلب العيادات والأطباء وحجوزات المريض السابقة للتحقق من التكرار
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clinicsData, doctorsData, myAppsData] = await Promise.all([
          api.get('/clinics'),
          api.get('/doctors'),
          api.get('/appointments/my-appointments').catch(() => []),
        ]);

        setClinics(clinicsData || []);
        setDoctors(doctorsData || []);

        // الاحتفاظ بالحجوزات النشطة فقط (غير الملغية أو المرفوضة)
        setMyExistingAppointments(
          (myAppsData || []).filter((app) => app.status !== 'Cancelled' && app.status !== 'Rejected')
        );

        // لو جاي من صفحة طبيب معين
        if (initialDoctorId) {
          const doc = (doctorsData || []).find((d) => d.id === Number(initialDoctorId));
          if (doc) {
            setSelectedClinic(String(doc.clinicId));
            setSelectedDoctor(String(doc.id));
          }
        }
      } catch (err) {
        console.error('Error fetching booking data:', err);
        setError('تعذر تحميل بيانات العيادات والأطباء. حدّث الصفحة وحاول مرة أخرى.');
      }
    };
    fetchData();
  }, [initialDoctorId]);

  // الأيام اللي المريض عنده فيها حجز نشط
  const bookedDates = useMemo(
    () => new Set(myExistingAppointments.map((app) => app.appointmentDate.split('T')[0])),
    [myExistingAppointments]
  );
  const dateAlreadyBooked = bookedDates.has(appointmentDate);

  // الأطباء حسب العيادة المختارة
  const filteredDoctors = useMemo(
    () => (selectedClinic ? doctors.filter((d) => d.clinicId === Number(selectedClinic)) : doctors),
    [doctors, selectedClinic]
  );

  const handleClinicChange = (e) => {
    const clinicId = e.target.value;
    setSelectedClinic(clinicId);
    const stillValid = doctors.some(
      (d) => d.id === Number(selectedDoctor) && d.clinicId === Number(clinicId)
    );
    if (!stillValid) setSelectedDoctor('');
  };

  // جلب المواعيد المتاحة عند اختيار الطبيب والتاريخ
  useEffect(() => {
    let cancelled = false;
    setSelectedSlot('');

    if (!selectedDoctor || !appointmentDate || dateAlreadyBooked) {
      setAvailableSlots([]);
      return undefined;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError('');
      try {
        const slots = await api.get(
          `/appointments/available-slots?doctorId=${selectedDoctor}&date=${appointmentDate}`
        );
        if (!cancelled) setAvailableSlots(slots || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'فشل جلب المواعيد المتاحة لهذا اليوم');
          setAvailableSlots([]);
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDoctor, appointmentDate, dateAlreadyBooked]);

  // إرسال طلب الحجز
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dateAlreadyBooked) {
      setError('لديك موعد آخر مسجل في هذا اليوم. لا يمكن حجز أكثر من موعد في اليوم نفسه.');
      return;
    }

    if (!selectedSlot) {
      setError('يرجى اختيار أحد الأوقات المتاحة للحجز.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/appointments/book', {
        doctorId: Number(selectedDoctor),
        appointmentDate,
        timeSlot: `${selectedSlot}:00`,
        notes,
      });

      setSuccess('تم تقديم طلب الحجز بنجاح. سيتم تحويلك إلى صفحة حجوزاتي...');
      redirectTimer.current = setTimeout(() => {
        navigate('/patient/my-appointments');
      }, 2000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إتمام الحجز');
      setSubmitting(false);
    }
  };

  const renderSlots = () => {
    if (dateAlreadyBooked) {
      return (
        <p className="slots-note slots-note-warning">
          لديك بالفعل موعد نشط في هذا اليوم. لا يمكن حجز أكثر من موعد في اليوم نفسه.
        </p>
      );
    }
    if (loadingSlots) {
      return (
        <p className="slots-note">
          <span className="spinner-primary" />
          جاري تحميل الأوقات المتاحة...
        </p>
      );
    }
    if (!selectedDoctor || !appointmentDate) {
      return <p className="slots-note">اختر الطبيب وتاريخ الزيارة لعرض المواعيد المتاحة.</p>;
    }
    if (availableSlots.length === 0) {
      return (
        <p className="slots-note slots-note-warning">
          الطبيب غير متاح في هذا اليوم أو أن جميع المواعيد محجوزة. يرجى اختيار تاريخ آخر.
        </p>
      );
    }
    return (
      <div className="slots-grid">
        {availableSlots.map((slot) => (
          <button
            type="button"
            key={slot}
            className={`slot-chip${selectedSlot === slot ? ' selected' : ''}`}
            aria-pressed={selectedSlot === slot}
            onClick={() => setSelectedSlot(slot)}
          >
            {slot}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="book-appointment-wrapper">
      <div className="booking-card">
        <header className="booking-header">
          <h1>حجز موعد كشف جديد</h1>
          <p>اختر العيادة والطبيب والوقت المناسب لك.</p>
        </header>

        {error && (
          <div className="alert-banner alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert-banner alert-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="selectClinic">العيادة</label>
            <select id="selectClinic" value={selectedClinic} onChange={handleClinicChange} required>
              <option value="">اختر العيادة</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.address})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="selectDoctor">الطبيب</label>
            <select
              id="selectDoctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
              disabled={!selectedClinic}
            >
              <option value="">{selectedClinic ? 'اختر الطبيب' : 'اختر العيادة أولاً'}</option>
              {filteredDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  د. {d.fullName} - {d.specialtyName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="appointmentDate">تاريخ الزيارة</label>
            <input
              id="appointmentDate"
              type="date"
              min={getTodayString()}
              value={appointmentDate}
              onChange={(e) => {
                setAppointmentDate(e.target.value);
                setError('');
              }}
              required
              disabled={!selectedDoctor}
            />
          </div>

          <div className="form-group" role="group" aria-labelledby="slots-label">
            <span id="slots-label" className="field-label">
              الأوقات المتاحة
            </span>
            {renderSlots()}
          </div>

          <div className="form-group">
            <label htmlFor="bookingNotes">
              سبب الزيارة أو ملاحظات <span className="optional-tag">(اختياري)</span>
            </label>
            <textarea
              id="bookingNotes"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي أعراض تشعر بها أو ملاحظات تود مشاركتها مع الطبيب"
            />
          </div>

          <button
            type="submit"
            className="btn-submit-booking"
            disabled={submitting || !selectedSlot || dateAlreadyBooked}
          >
            {submitting ? (
              <span className="btn-loading-content">
                <span className="spinner-white" />
                جاري تأكيد الحجز...
              </span>
            ) : (
              'تأكيد الحجز'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;