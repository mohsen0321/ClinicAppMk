import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// الصفحات العامة
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Doctors from './pages/public/Doctors';
import DoctorDetails from './pages/public/DoctorDetails';
import Clinics from './pages/public/Clinics';

// صفحات المريض
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import PatientProfile from './pages/patient/PatientProfile';

// صفحات المسؤول Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageClinics from './pages/admin/ManageClinics';
import ManageSpecialties from './pages/admin/ManageSpecialties';
import ManagePatients from './pages/admin/ManagePatients';
import AdminProfile from './pages/admin/AdminProfile';
import ForgotPassword from './pages/public/ForgotPassword';
import ScrollToTop from './components/ScrollToTop';

function App() {
  // 🟢 التحكم في الصيانة مباشرة من هنا:
  // لو عايز "توقّف" الموقع وتظهر صفحة الصيانة، خليها: true
  // لو عايز تشغل الموقع طبيعي، خليها: false
  const isMaintenance = true;

  if (isMaintenance) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Tahoma, sans-serif',
        backgroundColor: '#f8f9fa',
        color: '#333',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛠️</div>
        <h1 style={{ color: '#e74c3c', marginBottom: '10px' }}>الموقع تحت التحديث والصيانة</h1>
        <p style={{ fontSize: '18px', color: '#666', maxWidth: '500px', lineHeight: '1.6' }}>
          نقوم حالياً بإجراء بعض التحديثات البرمجية لتحسين تجربة الاستخدام. سنعود للعمل بكامل طاقتنا قريباً!
        </p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <ScrollToTop />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* الصفحات العامة */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:id" element={<DoctorDetails />} />
              <Route path="/clinics" element={<Clinics />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* صفحات المريض المحمية */}
              <Route
                path="/patient/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/book"
                element={
                  <ProtectedRoute allowedRoles={['Patient']}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/my-appointments"
                element={
                  <ProtectedRoute allowedRoles={['Patient']}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/profile"
                element={
                  <ProtectedRoute allowedRoles={['Patient']}>
                    <PatientProfile />
                  </ProtectedRoute>
                }
              />

              {/* صفحات الإدارة المحمية للأدمن فقط */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="appointments" element={<ManageAppointments />} />
                <Route path="doctors" element={<ManageDoctors />} />
                <Route path="clinics" element={<ManageClinics />} />
                <Route path="specialties" element={<ManageSpecialties />} />
                <Route path="patients" element={<ManagePatients />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* إعادة التوجيه للمسارات غير المعروفة */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;