export default function Loading() {
    return (
      <div className="fixed inset-0 z-999 flex flex-col items-center justify-center">
        {/* Logo atau Inisial Brand */}
        <div className="relative flex items-center justify-center">
          {/* Lingkaran Animasi di Belakang */}
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20 duration-1000" />
          
          {/* Simbol Utama */}
          <div className="relative h-20 w-20 flex items-center justify-center">
            <img src="/assets/logo hitam.png" className="w-full dark:hidden  " alt="Logo" />
            <img src="/assets/logo putih.png" className="w-full hidden dark:block" alt="Logo" />
          </div>
        </div>
  
        {/* Teks Status */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">
            Memuat Halaman
          </p>
          <div className="h-0.5 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
            <div 
                className="absolute inset-0 bg-black dark:bg-white" 
                style={{
                animation: 'progress-loading 1.5s infinite linear',
                backgroundImage: 'linear-gradient(to right, transparent, currentColor, transparent)'
                }} 
            />
            <style jsx>{`
                @keyframes progress-loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
                }
            `}</style>
            </div>
        </div>
      </div>
    );
  }