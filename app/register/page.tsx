"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from "next/navigation";
import { useGoogleLogin } from '@react-oauth/google';
import axiosInstance from '@/lib/axios';
import { Loader2 } from "lucide-react";

/**
 * Daftar kode negara populer (Bisa ditambah sesuai kebutuhan)
 */
const countryCodes = [
  { code: '+62', label: 'ID' },
  { code: '+1', label: 'US' },
  { code: '+60', label: 'MY' },
  { code: '+65', label: 'SG' },
  { code: '+44', label: 'UK' },
  { code: '+81', label: 'JP' },
];

const RegisterPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
};

const RegisterFormContent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, login } = useAuth();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Gabungkan kode negara dengan nomor telepon sebelum dikirim ke backend
    const fullPhone = `${countryCode}${phoneNumber.replace(/^0+/, '')}`;

    try {
      await register({ name, email, phone: fullPhone, password }, callbackUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat akun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      setError('');
      try {
        const res = await axiosInstance.post('/auth/google', {
          token: tokenResponse.access_token,
        });
        await login({ type: 'social', data: res.data }, callbackUrl);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal autentikasi Google.');
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => setError('Registrasi Google dibatalkan.')
  });

  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen flex flex-col items-center justify-center px-4 font-sans">
      
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-extrabold tracking-tighter uppercase dark:text-white">
          ESBEG <span className="font-light text-gray-400 dark:text-neutral-600">Store</span>
        </h1>
      </div>

      <div className="w-full max-w-[500px] bg-neutral-50 border dark:bg-neutral-900 p-8 md:p-12 rounded-3xl dark:border-neutral-800 shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Akun</h2>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">Lengkapi data dirimu untuk mulai belanja.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/50 font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-neutral-200 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Nama Lengkap Anda'
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-neutral-200 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='your@email.com'
              required
            />
          </div>

          {/* Phone Number with Country Code */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2">Phone Number</label>
            <div className="flex gap-2">
              <select 
                className="w-24 px-2 py-3 bg-neutral-200 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all cursor-pointer appearance-none text-center font-medium"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} {c.code}
                  </option>
                ))}
              </select>
              <input 
                type="tel" 
                className="flex-1 px-4 py-3 bg-neutral-200 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder='8123456789'
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-neutral-200 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder='••••••••'
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black dark:bg-white text-white dark:text-black text-sm font-bold py-4 rounded-full mt-4 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="relative my-10 flex items-center">
          <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Atau</span>
          <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
        </div>

        <button 
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white text-sm font-bold py-4 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm disabled:opacity-50"
        >
          {/* SVG Google tetap sama */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Daftar dengan Google
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-black dark:text-white font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;