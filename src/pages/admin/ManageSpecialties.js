import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './ManageSpecialties.css';

const ManageSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة فتح نافذة الإضافة/التعديل
  const [specModal, setSpecModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // نافذة الإشعارات التفاعلية (Z-index أعلى)
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: '',
  });

  // نافذة تأكيد الحذف
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    specId: null,
    specName: ''
  });

  const fetchSpecialties = async () => {
    try {
      const data = await api.get('/specialties');
      setSpecialties(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const showPopup = (type, title, message) => {
    setInfoModal({ isOpen: true, type, title, message });
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', description: '' });
    setSpecModal(true);
  };

  const handleOpenEdit = (spec) => {
    setIsEditing(true);
    setCurrentId(spec.id);
    setFormData({ name: spec.name, description: spec.description || '' });
    setSpecModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/specialties/${currentId}`, formData);
        showPopup('success', 'تم التحديث', 'تم تعديل بيانات التخصص الطبي بنجاح.');
      } else {
        await api.post('/specialties', formData);
        showPopup('success', 'تمت الإضافة', 'تم إضافة التخصص الجديد وتفعيله في النظام.');
      }
      setSpecModal(false);
      fetchSpecialties();
    } catch (err) {
      showPopup('error', 'فشل الحفظ', err.message || 'حدث خطأ أثناء معالجة البيانات.');
    }
  };

  const openDeleteConfirm = (spec) => {
    setDeleteModal({
      isOpen: true,
      specId: spec.id,
      specName: spec.name
    });
  };

  const executeDelete = async () => {
    const id = deleteModal.specId;
    setDeleteModal({ isOpen: false, specId: null, specName: '' });
    try {
      await api.delete(`/specialties/${id}`);
      showPopup('success', 'تم الحذف', 'تمت إزالة التخصص من النظام بنجاح.');
      fetchSpecialties();
    } catch (err) {
      showPopup('error', 'تعذر الحذف', 'لا يمكن حذف هذا التخصص لارتباطه بأطباء مسجلين.');
    }
  };

  return (
    <div className="manage-page-container">
      {/* الهيدر العلوي */}
      <div className="page-header-flex">
        <div className="admin-header">
          <span className="page-badge">تصنيفات النظام</span>
          <h1>إدارة التخصصات الطبية</h1>
          <p>تنظيم وتصنيف المجالات الطبية المتاحة وتوزيع الكادر الطبي عليها</p>
        </div>
        <button type="button" onClick={handleOpenAdd} className="btn-add-new">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>إضافة تخصص جديد</span>
        </button>
      </div>

      {/* الجدول */}
      <div className="admin-table-card">
        {loading ? (
          <div className="table-skeleton-container">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="table-skeleton-row" />
            ))}
          </div>
        ) : specialties.length === 0 ? (
          <div className="no-data-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <p>لا توجد تخصصات مسجلة حالياً.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>اسم التخصص</th>
                  <th>الوصف</th>
                  <th>الأطباء المسجلين</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {specialties.map((s) => (
                  <tr key={s.id}>
                    <td className="spec-name-cell">
                      <strong>{s.name}</strong>
                    </td>
                    <td>
                      <span className="spec-desc-text">{s.description || '—'}</span>
                    </td>
                    <td>
                      <span className="badge-status badge-accepted">
                        <span className="badge-dot" />
                        {s.doctorsCount || 0} أطباء
                      </span>
                    </td>
                    <td>
                      <div className="table-btn-group">
                        <button type="button" onClick={() => handleOpenEdit(s)} className="btn-adm-action complete" title="تعديل">
                          تعديل
                        </button>
                        <button type="button" onClick={() => openDeleteConfirm(s)} className="btn-adm-action delete" title="حذف">
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

      {/* نافذة الإضافة / التعديل (Modal) */}
      {specModal && (
        <div className="modal-backdrop" onClick={() => setSpecModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-title">
              <h3>{isEditing ? 'تعديل التخصص الطبي' : 'إضافة تخصص جديد'}</h3>
              <p>أدخل المسمى الدقيق للتخصص ووصفاً موجزاً عنه</p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-grid">
              <div className="form-group-modal">
                <label htmlFor="specName">اسم التخصص:</label>
                <input
                  id="specName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: طب وجراحة العيون"
                  required
                />
              </div>

              <div className="form-group-modal">
                <label htmlFor="specDesc">وصف التخصص:</label>
                <textarea
                  id="specDesc"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر للخدمات الطبية المقدمة..."
                />
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="btn-modal-confirm">حفظ التعديلات</button>
                <button type="button" className="btn-modal-cancel" onClick={() => setSpecModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف (Delete Confirmation) */}
      {deleteModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setDeleteModal({ isOpen: false, specId: null, specName: '' })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="modal-title">تأكيد حذف التخصص</h3>
            <p className="modal-message">
              هل أنت متأكد من حذف تخصص <strong>"{deleteModal.specName}"</strong>؟ هذا الإجراء قد يفشل إذا كان التخصص مرتبطاً بأطباء مسجلين.
            </p>
            <div className="modal-actions-row" style={{ width: '100%' }}>
              <button type="button" className="btn-modal-danger" onClick={executeDelete}>نعم، احذف</button>
              <button type="button" className="btn-modal-cancel" onClick={() => setDeleteModal({ isOpen: false, specId: null, specName: '' })}>تراجع</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإشعارات التفاعلية (Z-index: 3000) */}
      {infoModal.isOpen && (
        <div className="info-popup-backdrop" onClick={() => setInfoModal({ ...infoModal, isOpen: false })}>
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
            <button type="button" className={`btn-modal-close ${infoModal.type}`} onClick={() => setInfoModal({ ...infoModal, isOpen: false })}>
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSpecialties;