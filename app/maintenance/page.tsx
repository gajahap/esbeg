"use client";

import React from "react";
import { Frown, RefreshCcw, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MaintenancePage() {
  const router = useRouter();

  const handleRetry = () => {
    // Mencoba memuat ulang halaman untuk cek koneksi API kembali
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6">
      {/* Background Decor (Opsional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2.5rem] shadow-xl">
            <Frown className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-black tracking-tighter mb-4 dark:text-white">
          Layanan belum tersedia
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed">
          Maaf, saat ini layanan kami belum tersedia, silakan coba beberapa saat lagi.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3">
          <Button 
            onClick={handleRetry}
            className="h-14 rounded-full bg-black dark:bg-white dark:text-black font-bold text-lg gap-2 shadow-lg active:scale-95 transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
            Coba Hubungkan Kembali
          </Button>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex-1 h-12 rounded-full border-neutral-200 dark:border-neutral-800 gap-2"
            >
              <Home className="w-4 h-4" />
              Beranda
            </Button>
            
            <Button 
              variant="outline"
              className="flex-1 h-12 rounded-full border-neutral-200 dark:border-neutral-800 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Bantuan
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-12 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
          Status Sistem: <span className="text-red-500 animate-pulse underline decoration-red-500/30">Offline</span>
        </p>
      </div>
    </div>
  );
}