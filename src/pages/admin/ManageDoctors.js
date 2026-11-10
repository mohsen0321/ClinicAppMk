import React, { useEffect, useState } from 'react';
import { api, BASE_URL } from '../../services/api';
import './ManageDoctors.css';

const daysArabic = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [doctorModal, setDoctorModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);

  const initialForm = {
    firstName: '', lastName: '', email: '', phoneNumber: '', password: '',
    biography: '', profilePictureUrl: '', specialtyId: '', clinicId: '',
    appointmentDurationMinutes: 30,
    workingHours: [
      { dayOfWeek: 0, startTime: '09:00:00', endTime: '17:00:00', isAvailable: true },
      { dayOfWeek: 1, startTime: '09:00:00', endTime: '17:00:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '09:00:00', endTime: '17:00:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '09:00:00', endTime: '17:00:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '09:00:00', endTime: '17:00:00', isAvailable: true },
    ]
  };

  const [formData, setFormData] = useState(initialForm);
  const [infoModal, setInfoModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const fetchAll = async () => {
    try {
      const [docs, specs, cls] = await Promise.all([
        api.get('/doctors'), api.get('/specialties'), api.get('/clinics')
      ]);
      setDoctors(docs || []);
      setSpecialties(specs || []);
      setClinics(cls || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(initialForm);
    setDoctorModal(true);
  };

  const handleOpenEdit = async (doc) => {
    try {
      const details = await api.get(`/doctors/${doc.id}`);
      setIsEditing(true);
      setCurrentDocId(doc.id);
      setFormData({
        ...details,
        firstName: details.userFirstName,
        lastName: details.userLastName,
        email: details.userEmail,
        phoneNumber: details.userPhoneNumber,
        password: '',
        isActive: details.userIsActive
      });
      setDoctorModal(true);
    } catch (err) {
      showPopup('error', 'خطأ في التحميل', 'تعذر جلب بيانات الطبيب حالياً.');
    }
  };

  const showPopup = (type, title, message) => {
    setInfoModal({ isOpen: true, type, title, message });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post('/upload', data);
      setFormData((prev) => ({ ...prev, profilePictureUrl: res.url }));
    } catch (err) {
      showPopup('error', 'فشل الرفع', 'حدث خطأ أثناء رفع الصورة.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        specialtyId: parseInt(formData.specialtyId),
        clinicId: parseInt(formData.clinicId),
        appointmentDurationMinutes: parseInt(formData.appointmentDurationMinutes),
      };

      if (isEditing) {
        await api.put(`/doctors/${currentDocId}`, payload);
        showPopup('success', 'تم التحديث بنجاح', 'تم حفظ بيانات الطبيب الجديدة في النظام.');
      } else {
        await api.post('/doctors', payload);
        showPopup('success', 'تمت الإضافة بنجاح', 'تم إنشاء حساب الطبيب وتفعيل صلاحياته.');
      }
      setDoctorModal(false);
      fetchAll();
    } catch (err) {
      showPopup('error', 'فشل الحفظ', err.message || 'تأكد من البيانات والمحاولة مجدداً.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/doctors/${id}/toggle-status`);
      showPopup('success', 'تحديث الحالة', res.message);
      fetchAll();
    } catch (err) {
      showPopup('error', 'فشل العملية', 'تعذر تغيير حالة الحساب حالياً.');
    }
  };

  return (
    <div className="manage-page-container">
      <div className="page-header-flex">
        <div className="admin-header">
          <span className="page-badge">الكادر الطبي</span>
          <h1>إدارة الأطباء والاستشاريين</h1>
          <p>إضافة أطباء جدد، ضبط جداول العمل، وتحديث الملفات الشخصية</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-add-new">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>إضافة طبيب جديد</span>
        </button>
      </div>

      <div className="admin-table-card">
        {loading ? (
          <div className="table-skeleton-container">{[1, 2, 3, 4].map(n => <div key={n} className="table-skeleton-row" />)}</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>الطبيب</th>
                  <th>التخصص</th>
                  <th>العيادة</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="doctor-name-cell">
                        <img src={d.profilePictureUrl ? `${BASE_URL}${d.profilePictureUrl}` : 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'} alt="" className="doctor-thumb" />
                        <div><strong>{d.fullName}</strong><div className="doctor-email-sub">{d.email}</div></div>
                      </div>
                    </td>
                    <td>{d.specialtyName}</td>
                    <td>{d.clinicName}</td>
                    <td>
                      <span className={`badge-status ${d.isActive ? 'badge-accepted' : 'badge-rejected'}`}>
                        <span className="badge-dot" />{d.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td>
                      <div className="table-btn-group">
                        <button onClick={() => handleOpenEdit(d)} className="btn-adm-action complete">تعديل</button>
                        <button onClick={() => handleToggleStatus(d.id)} className={`btn-adm-action ${d.isActive ? 'reject' : 'accept'}`}>
                          {d.isActive ? 'تعطيل' : 'تفعيل'}
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

      {/* نافذة الإدخال (Add/Edit Modal) */}
      {doctorModal && (
        <div className="modal-backdrop" onClick={() => setDoctorModal(false)}>
          <div className="modal-box modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-title">
              <h3>{isEditing ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}</h3>
              <p>يرجى إدخال البيانات المهنية وساعات العمل الأسبوعية</p>
            </div>

            <form onSubmit={handleSubmit} className="doctor-form">
              <div className="form-row">
                <div className="form-group">
                  <label>الاسم الأول</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>الاسم الأخير</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} required />
                </div>
              </div>

              {!isEditing && (
                <div className="form-group">
                  <label>كلمة المرور الافتراضية</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required minLength={6} placeholder="6 أحرف على الأقل" />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>التخصص الطبي</label>
                  <select value={formData.specialtyId} onChange={(e) => setFormData({...formData, specialtyId: e.target.value})} required>
                    <option value="">اختر التخصص</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>العيادة</label>
                  <select value={formData.clinicId} onChange={(e) => setFormData({...formData, clinicId: e.target.value})} required>
                    <option value="">اختر العيادة</option>
                    {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>مدة الكشف (دقيقة)</label>
                  <input type="number" min="10" step="5" value={formData.appointmentDurationMinutes} onChange={(e) => setFormData({...formData, appointmentDurationMinutes: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>صورة الطبيب</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="form-group">
                <label>نبذة تعريفية</label>
                <textarea rows="2" value={formData.biography} onChange={(e) => setFormData({...formData, biography: e.target.value})} placeholder="خبرات ومؤهلات الطبيب..." />
              </div>

              <h4 className="working-hours-title">ساعات العمل الأسبوعية:</h4>
              <div className="working-hours-picker">
                {formData.workingHours.map((wh, idx) => (
                  <div key={idx} className="wh-row">
                    <span className="wh-day-label">{daysArabic[wh.dayOfWeek]}</span>
                    <label className="wh-checkbox-label">
                      <input type="checkbox" checked={wh.isAvailable} onChange={(e) => {
                        const updated = [...formData.workingHours];
                        updated[idx].isAvailable = e.target.checked;
                        setFormData({...formData, workingHours: updated});
                      }} />
                      <span>متاح</span>
                    </label>
                    {wh.isAvailable && (
                      <div className="wh-time-inputs">
                        <input type="time" value={wh.startTime.substring(0, 5)} onChange={(e) => {
                          const updated = [...formData.workingHours];
                          updated[idx].startTime = `${e.target.value}:00`;
                          setFormData({...formData, workingHours: updated});
                        }} />
                        <span>إلى</span>
                        <input type="time" value={wh.endTime.substring(0, 5)} onChange={(e) => {
                          const updated = [...formData.workingHours];
                          updated[idx].endTime = `${e.target.value}:00`;
                          setFormData({...formData, workingHours: updated});
                        }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="btn-modal-confirm">حفظ بيانات الطبيب</button>
                <button type="button" className="btn-modal-cancel" onClick={() => setDoctorModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة الإشعارات (Popup Modal) - تظهر فوق الكل بفضل Z-Index 3000 */}
      {infoModal.isOpen && (
        <div className="info-popup-backdrop" onClick={() => setInfoModal({...infoModal, isOpen: false})}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon-wrapper ${infoModal.type}`}>
              {infoModal.type === 'success' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              )}
            </div>
            <h3 className="modal-title">{infoModal.title}</h3>
            <p className="modal-message">{infoModal.message}</p>
            <button className={`btn-modal-close ${infoModal.type}`} onClick={() => setInfoModal({...infoModal, isOpen: false})}>حسناً، فهمت</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;