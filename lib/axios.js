import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000, // Dikurangi ke 15 detik agar user tidak menunggu terlalu lama saat koneksi mati
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// --- INTERCEPTORS REQUEST ---
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTORS RESPONSE ---
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. PENANGANAN NETWORK ERROR / API MATI
    // Jika tidak ada error.response, berarti request tidak sampai ke server
    if (!error.response || error.code === 'ERR_NETWORK') {
      console.error('Koneksi ke API gagal atau terputus.');
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        // Cek jika saat ini tidak sedang di halaman maintenance agar tidak looping
        if (window.location.pathname !== '/maintenance') {
          window.location.href = '/maintenance';
        }
      } 
      return Promise.reject(error);
    }

    // 2. PENANGANAN TIMEOUT
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout. Server terlalu lama merespon.');
    }

    // 3. PENANGANAN STATUS 401 (UNAUTHORIZED)
    if (error.response.status === 401) {
      console.warn('Sesi habis. Mengalihkan...');

      Cookies.remove('token');
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user'); 
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?error=session_expired';
        }
      }
    }

    // 4. PENANGANAN STATUS 503 (SERVICE UNAVAILABLE)
    if (error.response.status === 503) {
        window.location.href = '/maintenance';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;