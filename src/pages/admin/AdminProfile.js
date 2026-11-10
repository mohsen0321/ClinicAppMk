import React, { useState, useEffect } from 'react';
import { api, BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AdminProfile.css';

const AdminProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profilePictureUrl: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // نافذة الإشعارات الخفيفة والسريعة
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/auth/me');
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          profilePictureUrl: data.profilePictureUrl || '',
        });
      } catch (err) {
        console.error('Error fetching admin profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showPopup = (type, title, message) => {
    setInfoModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setInfoModal((prev) => ({ ...prev, isOpen: false }));
  };

  // رفع صورة شخصية جديدة
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData);
      setProfile((prev) => ({ ...prev, profilePictureUrl: res.url }));
      await api.put('/auth/profile', {
        ...profile,
        profilePictureUrl: res.url,
      });
      updateUser({ profilePictureUrl: res.url });
      showPopup('success', 'تم تغيير الصورة', 'تم تحديث صورتك الشخصية بنجاح.');
    } catch (err) {
      showPopup('error', 'فشل الرفع', err.message || 'حدث خطأ أثناء رفع الصورة.');
    }
  };

  // حذف الصورة الشخصية
  const handleDeleteImage = async () => {
    if (!window.confirm('هل تريد حذف صورتك الشخصية؟')) return;
    try {
      setProfile((prev) => ({ ...prev, profilePictureUrl: '' }));
      await api.put('/auth/profile', {
        ...profile,
        profilePictureUrl: null,
      });
      updateUser({ profilePictureUrl: null });
      showPopup('success', 'تم حذف الصورة', 'تمت إزالة الصورة الشخصية بنجاح.');
    } catch (err) {
      showPopup('error', 'خطأ', err.message || 'فشل حذف الصورة الشخصية.');
    }
  };

  // حفظ البيانات الأساسية
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', profile);
      updateUser({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        profilePictureUrl: profile.profilePictureUrl
      });
      showPopup('success', 'تم الحفظ', 'تم تحديث البيانات الشخصية بنجاح.');
    } catch (err) {
      showPopup('error', 'فشل التحديث', err.message || 'حدث خطأ أثناء حفظ التعديلات.');
    } finally {
      setSavingProfile(false);
    }
  };

  // تغيير كلمة المرور
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      showPopup('error', 'تنبيه', 'كلمتا المرور الجديدتان غير متطابقتين.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', passwords);
      showPopup('success', 'تم التغيير', 'تم تحديث كلمة المرور بنجاح.');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      showPopup('error', 'فشل العملية', err.message || 'تأكد من صحة كلمة المرور الحالية.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-profile-container">
        <div className="profile-skeleton-header" />
        <div className="admin-profile-grid">
          <div className="profile-skeleton-card" />
          <div className="profile-skeleton-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      {/* هيدر الصفحة */}
      <div className="admin-header">
        <span className="page-badge">حساب الأدمن</span>
        <h1>الملف الشخصي للمسؤول</h1>
        <p>إدارة البيانات الأساسية، الصورة الشخصية، وإعدادات كلمة المرور</p>
      </div>

      <div className="admin-profile-grid">
        {/* بطاقة البيانات الأساسية والصورة */}
        <div className="admin-profile-card">
          <div className="card-title-group">
            <svg className="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2>البيانات الأساسية</h2>
          </div>

          {/* قسم Avatar والصورة الشخصية */}
          <div className="avatar-section">
            <div className="avatar-preview-wrapper">
              {profile.profilePictureUrl ? (
                <img
                  src={`${BASE_URL}${profile.profilePictureUrl}`}
                  alt="Admin Avatar"
                  className="current-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="avatar-placeholder"
                style={{ display: profile.profilePictureUrl ? 'none' : 'flex' }}
              >
                <span>
                  {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
            </div>

            <div className="avatar-actions">
              <label className="btn-upload-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>تغيير الصورة</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>

              {profile.profilePictureUrl && (
                <button type="button" onClick={handleDeleteImage} className="btn-delete-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>حذف</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="admin-profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">الاسم الأول:</label>
                <input
                  id="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">الاسم الأخير:</label>
                <input
                  id="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني:</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">رقم الهاتف:</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-save-primary" disabled={savingProfile}>
              {savingProfile ? (
                <span className="btn-loading-state">
                  <span className="spinner" />
                  جاري الحفظ...
                </span>
              ) : (
                'حفظ التعديلات'
              )}
            </button>
          </form>
        </div>

        {/* بطاقة تغيير كلمة المرور */}
        <div className="admin-profile-card">
          <div className="card-title-group">
            <svg className="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2>تغيير كلمة المرور</h2>
          </div>
          <p className="card-desc">اختر كلمة مرور قوية وآمنة لحماية الحساب</p>

          <form onSubmit={handlePasswordSubmit} className="admin-profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">كلمة المرور الحالية:</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">كلمة المرور الجديدة:</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmNewPassword">تأكيد كلمة المرور الجديدة:</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={passwords.confirmNewPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-save-primary" disabled={savingPassword}>
              {savingPassword ? (
                <span className="btn-loading-state">
                  <span className="spinner" />
                  جاري التحديث...
                </span>
              ) : (
                'تحديث كلمة المرور'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* النافذة المنبثقة السريعة والخفيفة جداً (Lightweight Popup) */}
      {infoModal.isOpen && (
        <div className="light-popup-overlay" onClick={closeModal}>
          <div className="light-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className={`light-popup-icon ${infoModal.type}`}>
              {infoModal.type === 'success' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>

            <h3 className="light-popup-title">{infoModal.title}</h3>
            <p className="light-popup-msg">{infoModal.message}</p>

            <button
              type="button"
              className="light-popup-btn"
              onClick={closeModal}
            >
              حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;