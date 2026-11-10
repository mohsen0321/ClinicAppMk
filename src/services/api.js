// عنوان الـ Backend (تأكد من مطابقته للبورت الذي يعمل عليه مشروعك في Visual Studio)
export const API_BASE_URL = 'http://clinicsystemmk.runasp.net/api';
export const BASE_URL = 'http://clinicsystemmk.runasp.net'; // لعرض مسارات الصور المرفوعة

// دالة مساعدة عامة لتنفيذ طلبات الـ Fetch
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
  };

  // إذا لم يكن الطلب عبارة عن FormData (مثل رفع الملفات)، نضع Content-Type: application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // إذا كان المستخدم مسجل دخوله ولديه Token، نرسله في الهيدر
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // إذا انتهت صلاحية التوكن أو غير مصرح له
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  // قراءة الرد سواء كان JSON أو نصياً
  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || (typeof data === 'string' ? data : 'حدث خطأ في الاتصال بالخادم');
    throw new Error(errorMsg);
  }

  return data;
}

// كائن الـ api الجاهز للاستخدام بكل الطرق: GET, POST, PUT, DELETE, PATCH
export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  put: (endpoint, body) => request(endpoint, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  patch: (endpoint, body) => request(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};