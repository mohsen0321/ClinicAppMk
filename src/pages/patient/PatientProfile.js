import React, { useState, useEffect } from 'react';
import { api, BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './PatientProfile.css';

const PatientProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
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

  // حالة الـ Toast Notifications السريعة
  const [toast, setToast] = useState({
    show: false,
    type: 'success', // 'success' | 'error'
    message: '',
  });

  // دالة لإظهار الـ Toast واختفائه تلقائياً بعد 4 ثوانٍ
  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/auth/me');
        const rawDob = data.dateOfBirth || data.DateOfBirth || data.birthDate || '';
        let formattedDob = '';
        if (rawDob) {
          formattedDob = rawDob.includes('T') ? rawDob.split('T')[0] : rawDob.substring(0, 10);
        }

        setProfile({
          firstName: data.firstName || data.FirstName || '',
          lastName: data.lastName || data.LastName || '',
          email: data.email || data.Email || '',
          phoneNumber: data.phoneNumber || data.PhoneNumber || '',
          dateOfBirth: formattedDob,
          gender: data.gender || data.Gender || '',
          address: data.address || data.Address || '',
          profilePictureUrl: data.profilePictureUrl || data.ProfilePictureUrl || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // التحقق من اكتمال البيانات الأساسية
  const isProfileComplete = () => {
    return (
      profile.firstName.trim() !== '' &&
      profile.lastName.trim() !== '' &&
      profile.email.trim() !== '' &&
      profile.phoneNumber.trim() !== '' &&
      profile.dateOfBirth.trim() !== '' &&
      profile.gender.trim() !== '' &&
      profile.address.trim() !== ''
    );
  };

  // تحديث البيانات الأساسية
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender || null,
        address: profile.address || null,
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : null,
        profilePictureUrl: profile.profilePictureUrl || null,
      };

      await api.put('/auth/profile', payload);
      updateUser({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email });

      showToast('تم حفظ كافة التعديلات والبيانات الشخصية بنجاح!', 'success');
    } catch (err) {
      showToast(err.message || 'تعذر حفظ البيانات، يرجى التأكد من ملء جميع الحقول.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // تغيير كلمة المرور
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      showToast('كلمتا المرور الجديدتان غير متطابقتين، يرجى التأكد.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

      showToast('تم تحديث كلمة المرور الخاصة بك بنجاح ', 'success');
    } catch (err) {
      showToast(err.message || 'فشل تغيير كلمة المرور، تأكد من صحة كلمة المرور الحالية.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // رفع صورة شخصية جديدة
  const handleImageUpload = async (e) => {
    if (!isProfileComplete()) {
      showToast('يجب ملء وحفظ جميع بيانات البروفايل الشخصية أولاً قبل رفع الصورة.', 'error');
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData);
      const newImageUrl = res.url;

      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender || null,
        address: profile.address || null,
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : null,
        profilePictureUrl: newImageUrl,
      };

      await api.put('/auth/profile', payload);

      setProfile((prev) => ({ ...prev, profilePictureUrl: newImageUrl }));
      updateUser({ profilePictureUrl: newImageUrl });

      showToast('تم رفع وتغيير الصورة الشخصية بنجاح ', 'success');
    } catch (err) {
      showToast(err.message || 'حدث خطأ أثناء رفع الصورة الشخصية.', 'error');
    }
  };

  // حذف الصورة الشخصية
  const handleDeleteImage = async () => {
    if (!window.confirm('هل تريد حذف صورتك الشخصية؟')) return;
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender || null,
        address: profile.address || null,
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : null,
        profilePictureUrl: null,
      };

      await api.put('/auth/profile', payload);

      setProfile((prev) => ({ ...prev, profilePictureUrl: '' }));
      updateUser({ profilePictureUrl: null });

      showToast('تم حذف الصورة الشخصية والعودة للافتراضي بنجاح', 'success');
    } catch (err) {
      showToast(err.message || 'فشل حذف الصورة.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-skeleton-header" />
        <div className="profile-grid">
          <div className="profile-skeleton-card" />
          <div className="profile-skeleton-card" />
        </div>
      </div>
    );
  }

  const profileComplete = isProfileComplete();

  return (
    <div className="profile-container">
      {/* Toast Notification Container */}
      <div className={`toast-notification ${toast.show ? 'show' : ''} ${toast.type}`}>
        <div className="toast-icon">
          {toast.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          )}
        </div>
        <span className="toast-message">{toast.message}</span>
        <button type="button" className="toast-close" onClick={() => setToast((prev) => ({ ...prev, show: false }))}>&times;</button>
      </div>

      {/* هيدر الصفحة */}
      <div className="page-header">
        <span className="page-badge">حسابي الشخصي</span>
        <h1>الملف الشخصي وإعدادات الحساب</h1>
        <p>إدارة وتعديل بياناتك الشخصية ومعلومات الأمان وحسابك الطبي</p>
      </div>

      <div className="profile-grid">
        {/* قسم الصورة والبيانات الشخصية */}
        <div className="profile-card">
          <div className="card-title-group">
            <svg className="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2>البيانات الشخصية</h2>
          </div>

          {!profileComplete && (
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fde68a' }}>
              ⚠️ يرجى استكمال وتحديث جميع بيانات البروفايل وحفظها لتتمكن من تفعيل ميزة رفع الصورة الشخصية.
            </div>
          )}

          {/* قسم Avatar والصورة */}
          <div className="avatar-section">
            <div className="avatar-preview-wrapper">
              {profile.profilePictureUrl ? (
                <img
                  src={`${BASE_URL}${profile.profilePictureUrl}`}
                  alt="Avatar"
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
                  {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>

            <div className="avatar-actions">
              <label
                className={`btn-upload-label ${!profileComplete ? 'disabled' : ''}`}
                style={{ opacity: profileComplete ? 1 : 0.6, cursor: profileComplete ? 'pointer' : 'not-allowed' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>تغيير الصورة</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={!profileComplete}
                  style={{ display: 'none' }}
                />
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

          <form onSubmit={handleProfileSubmit} className="profile-form">
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">تاريخ الميلاد:</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">الجنس:</label>
                <select
                  id="gender"
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  required
                >
                  <option value="">اختر الجنس</option>
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">العنوان:</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  id="address"
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="المدينة، الحي، الشارع"
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

        {/* قسم تغيير كلمة المرور */}
        <div className="profile-card password-card">
          <div className="card-title-group">
            <svg className="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2>تغيير كلمة المرور</h2>
          </div>
          <p className="section-desc">احرص على اختيار كلمة مرور قوية وغير مكررة للحفاظ على أمان حسابك</p>

          <form onSubmit={handlePasswordSubmit} className="profile-form">
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
    </div>
  );
};

export default PatientProfile;