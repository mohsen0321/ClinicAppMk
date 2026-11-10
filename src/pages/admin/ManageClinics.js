import React, { useEffect, useState } from 'react';
import { api, BASE_URL } from '../../services/api';
import './ManageClinics.css';

const ManageClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [clinicModal, setClinicModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialForm = {
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    imageUrl: '',
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);

  // نافذة الإشعارات التفاعلية (Info Popup)
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: '',
  });

  const fetchClinics = async () => {
    try {
      const data = await api.get('/clinics');
      setClinics(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData(initialForm);
    setClinicModal(true);
  };

  const handleOpenEdit = (clinic) => {
    setIsEditing(true);
    setCurrentId(clinic.id);
    setFormData({
      name: clinic.name,
      description: clinic.description || '',
      address: clinic.address,
      phoneNumber: clinic.phoneNumber,
      imageUrl: clinic.imageUrl || '',
      isActive: clinic.isActive
    });
    setClinicModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post('/upload', data);
      setFormData((prev) => ({ ...prev, imageUrl: res.url }));
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل رفع الصورة',
        message: err.message || 'تعذر رفع الصورة الشخصية للعيادة.',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/clinics/${currentId}`, formData);
        setInfoModal({
          isOpen: true,
          type: 'success',
          title: 'تم التحديث بنجاح',
          message: 'تم تعديل بيانات العيادة وحفظها في النظام.',
        });
      } else {
        await api.post('/clinics', formData);
        setInfoModal({
          isOpen: true,
          type: 'success',
          title: 'تمت إضافة العيادة',
          message: 'تمت إضافة العيادة الجديدة وتفعيلها بنجاح.',
        });
      }
      setClinicModal(false);
      fetchClinics();
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل الحفظ',
        message: err.message || 'حدث خطأ أثناء حفظ بيانات العيادة.',
      });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/clinics/${id}/toggle-status`);
      setInfoModal({
        isOpen: true,
        type: 'success',
        title: 'تحديث الحالة',
        message: res.message || 'تم تغيير حالة العيادة بنجاح.',
      });
      fetchClinics();
    } catch (err) {
      setInfoModal({
        isOpen: true,
        type: 'error',
        title: 'فشل العملية',
        message: err.message || 'تعذر تعديل حالة العيادة.',
      });
    }
  };

  return (
    <div className="manage-page-container">
      {/* الهيدر العلوي */}
      <div className="page-header-flex">
        <div className="admin-header">
          <span className="page-badge">الإدارة الطبية</span>
          <h1>إدارة العيادات والمراكز</h1>
          <p>إضافة وتعديل العيادات والفروع الطبية التابعة للمنصة</p>
        </div>
        <button type="button" onClick={handleOpenAdd} className="btn-add-new">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>إضافة عيادة جديدة</span>
        </button>
      </div>

      {/* جدول عرض العيادات */}
      <div className="admin-table-card">
        {loading ? (
          <div className="table-skeleton-container">
            {[1, 2, 3].map((n) => (
              <div key={n} className="table-skeleton-row" />
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <div className="no-data-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
            </svg>
            <p>لا توجد عيادات مسجلة في النظام حتى الآن.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>اسم العيادة</th>
                  <th>العنوان</th>
                  <th>الهاتف</th>
                  <th>عدد الأطباء</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="clinic-name-cell">
                        {c.imageUrl ? (
                          <img src={`${BASE_URL}${c.imageUrl}`} alt={c.name} className="clinic-thumb" />
                        ) : (
                          <div className="clinic-thumb-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 21h18M3 7v14M21 7v14M6 3h12a1 1 0 0 1 1 1v3H5V4a1 1 0 0 1 1-1z" />
                            </svg>
                          </div>
                        )}
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>{c.address}</td>
                    <td>
                      <span dir="ltr">{c.phoneNumber}</span>
                    </td>
                    <td>
                      <span className="doctors-count-badge">{c.doctorsCount || 0} أطباء</span>
                    </td>
                    <td>
                      <span className={`badge-status ${c.isActive ? 'badge-accepted' : 'badge-rejected'}`}>
                        <span className="badge-dot" />
                        {c.isActive ? 'مفعلة ونشطة' : 'معطلة'}
                      </span>
                    </td>
                    <td>
                      <div className="table-btn-group">
                        <button type="button" onClick={() => handleOpenEdit(c)} className="btn-adm-action complete" title="تعديل">
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c.id)}
                          className={`btn-adm-action ${c.isActive ? 'reject' : 'accept'}`}
                          title="تغيير الحالة"
                        >
                          {c.isActive ? 'تعطيل' : 'تفعيل'}
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

      {/* نافذة إضافة / تعديل عيادة (Modal) */}
      {clinicModal && (
        <div className="modal-backdrop" onClick={() => setClinicModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-title">
              <h3>{isEditing ? 'تعديل بيانات العيادة' : 'إضافة عيادة جديدة'}</h3>
              <p>قم بملء البيانات الأساسية للفرع أو المركز الطبي</p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-grid">
              <div className="form-group-modal">
                <label htmlFor="clinicName">اسم العيادة:</label>
                <input
                  id="clinicName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: عيادات النيل التخصصية"
                  required
                />
              </div>

              <div className="form-group-modal">
                <label htmlFor="clinicAddress">العنوان التفصيلي:</label>
                <input
                  id="clinicAddress"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="المدينة، الشارع، المبنى"
                  required
                />
              </div>

              <div className="form-group-modal">
                <label htmlFor="clinicPhone">رقم الهاتف:</label>
                <input
                  id="clinicPhone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="01012345678"
                  required
                />
              </div>

              <div className="form-group-modal">
                <label htmlFor="clinicDesc">الوصف التعريفي:</label>
                <textarea
                  id="clinicDesc"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="نبذة عن العيادة والخدمات المقدمة..."
                />
              </div>

              <div className="form-group-modal">
                <label htmlFor="clinicImage">صورة العيادة / الغلاف:</label>
                <input id="clinicImage" type="file" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="modal-actions-row" style={{ marginTop: '0.5rem' }}>
                <button type="submit" className="btn-modal-confirm">
                  {isEditing ? 'حفظ التعديلات' : 'إضافة العيادة الآن'}
                </button>
                <button type="button" className="btn-modal-cancel" onClick={() => setClinicModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة الإشعارات التفاعلية (Info Popup) */}
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

export default ManageClinics;