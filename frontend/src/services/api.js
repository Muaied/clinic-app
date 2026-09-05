import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://clinic-management-system-production-202f.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle errors & 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        if (error.config.url.includes('/login')) {
          const msg = data?.message === 'Account is disabled' ? 'هذا الحساب معطل، يرجى مراجعة المسؤول' : 'يوجد خطأ في اسم المستخدم أو كلمة المرور';
          toast.error(msg);
        } else {
          // Token expired or unauthorized
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('انتهت الجلسة، الرجاء تسجيل الدخول مجدداً');
        }
      } else if (status === 403) {
        toast.error('عذراً، لا تملك صلاحية للقيام بهذه العملية');
      } else {
        const message = data?.message || 'حدث خطأ أثناء الاتصال بالسيرفر';
        toast.error(message);
      }
    } else {
      toast.error('تعذر الاتصال بالسيرفر، تأكد من اتصالك بالإنترنت');
    }
    return Promise.reject(error);
  }
);

export default api;
