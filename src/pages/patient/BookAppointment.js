import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import './BookAppointment.css';

const BookAppointment = () => {
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

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

  // جلب العيادات والأطباء
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clinicsData, doctorsData] = await Promise.all([
          api.get('/clinics'),
          api.get('/doctors')
        ]);
        setClinics(clinicsData || []);
        setDoctors(doctorsData || []);

        // إذا كان قادماً من صفحة طبيب معين
        if (initialDoctorId) {
          const doc = (doctorsData || []).find((d) => d.id === parseInt(initialDoctorId));
          if (doc) {
            setSelectedClinic(doc.clinicId.toString());
            setSelectedDoctor(doc.id.toString());
          }
        }
      } catch (err) {
        console.error('Error fetching booking data:', err);
      }
    };
    fetchData();
  }, [initialDoctorId]);

  // تصفية الأطباء حسب العيادة المختارة
  useEffect(() => {
    if (selectedClinic) {
      const filtered = doctors.filter((d) => d.clinicId === parseInt(selectedClinic));
      setFilteredDoctors(filtered);
      if (!filtered.some((d) => d.id === parseInt(selectedDoctor))) {
        setSelectedDoctor('');
      }
    } else {
      setFilteredDoctors(doctors);
    }
  }, [selectedClinic, doctors, selectedDoctor]);

  // جلب المواعيد المتاحة عند اختيار الطبيب والتاريخ
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !appointmentDate) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      setError('');
      try {
        const slots = await api.get(`/appointments/available-slots?doctorId=${selectedDoctor}&date=${appointmentDate}`);
        setAvailableSlots(slots || []);
        setSelectedSlot('');
      } catch (err) {
        setError(err.message || 'فشل جلب المواعيد المتاحة لهذا اليوم');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, appointmentDate]);

  // إرسال طلب الحجز
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('يرجى اختيار أحد الأوقات المتاحة للحجز');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/appointments/book', {
        doctorId: parseInt(selectedDoctor),
        appointmentDate: appointmentDate,
        timeSlot: `${selectedSlot}:00`,
        notes: notes,
      });

      setSuccess('تم تقديم طلب الحجز بنجاح! سيتم تحويلك إلى صفحة حجوزاتي...');
      setTimeout(() => {
        navigate('/patient/my-appointments');
      }, 2000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إتمام الحجز');
    } finally {
      setSubmitting(false);
    }
  };

  // أقل تاريخ مسموح به هو اليوم
  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="book-appointment-wrapper">
      <div className="booking-card">
        {/* رأس البطاقة */}
        <div className="booking-header">
          <div className="booking-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M12 14v4M10 16h4" />
            </svg>
          </div>
          <h2>حجز موعد كشف جديد</h2>
          <p>اختر العيادة، الطبيب، والوقت المناسب لحجز استشارتك بخطوات بسيطة</p>
        </div>

        {/* تنبيهات الخطأ والنجاح */}
        {error && (
          <div className="alert-banner alert-error" role="alert">
            <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-banner alert-success" role="alert">
            <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form">
          {/* 1. اختيار العيادة */}
          <div className="form-group">
            <label htmlFor="selectClinic">
              <span className="step-badge">1</span>
              <span>اختر العيادة الطبيّة:</span>
            </label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
              </svg>
              <select
                id="selectClinic"
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                required
              >
                <option value="">-- اضغط لاختيار العيادة --</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.address})</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. اختيار الطبيب */}
          <div className="form-group">
            <label htmlFor="selectDoctor">
              <span className="step-badge">2</span>
              <span>اختر الطبيب المعالج:</span>
            </label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 9v6" />
                <path d="M9 12h6" />
              </svg>
              <select
                id="selectDoctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
                disabled={!selectedClinic}
              >
                <option value="">{selectedClinic ? '-- اضغط لاختيار الطبيب --' : 'يرجى اختيار العيادة أولاً'}</option>
                {filteredDoctors.map((d) => (
                  <option key={d.id} value={d.id}>د. {d.fullName} - {d.specialtyName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. اختيار التاريخ */}
          <div className="form-group">
            <label htmlFor="appointmentDate">
              <span className="step-badge">3</span>
              <span>تاريخ الزيارة:</span>
            </label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                id="appointmentDate"
                type="date"
                min={todayString}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                disabled={!selectedDoctor}
              />
            </div>
          </div>

          {/* 4. اختيار الوقت المتاح */}
          <div className="form-group">
            <label>
              <span className="step-badge">4</span>
              <span>الأوقات المتاحة في هذا اليوم:</span>
            </label>

            {loadingSlots ? (
              <div className="slots-loading-state">
                <span className="spinner-primary" />
                <span>جاري استعلام الأوقات المتاحة من جدول الطبيب...</span>
              </div>
            ) : !selectedDoctor || !appointmentDate ? (
              <div className="slots-placeholder-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>حدد الطبيب وتاريخ الزيارة لإظهار المواعيد الشاغرة</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="no-slots-alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>عذراً، الطبيب غير متاح في هذا اليوم أو جميع المواعيد محجوزة بالكامل. يرجى اختيار تاريخ آخر.</span>
              </div>
            ) : (
              <div className="slots-grid">
                {availableSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    className={`slot-chip ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <svg className="slot-clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. ملاحظات الزيارة */}
          <div className="form-group">
            <label htmlFor="bookingNotes">
              <span className="step-badge optional">5</span>
              <span>سبب الزيارة أو ملاحظات طبية (اختياري):</span>
            </label>
            <div className="textarea-wrapper">
              <textarea
                id="bookingNotes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب هنا أي أعراض تشعر بها أو ملاحظات تود مشاركتها مع الطبيب..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit-booking"
            disabled={submitting || !selectedSlot}
          >
            {submitting ? (
              <span className="btn-loading-content">
                <span className="spinner-white" />
                جاري تأكيد الحجز...
              </span>
            ) : (
              <span className="btn-submit-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>تأكيد حجز الموعد</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;