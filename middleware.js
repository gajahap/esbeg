import { NextResponse } from 'next/server';

// 1. Daftar rute yang bisa diakses tanpa login
const publicRoutes = ['/login', '/register', '/', '/product','/maintenance','/about'];

// 2. Daftar rute khusus Auth (akan diredirect ke dashboard jika sudah login)
const authRoutes = ['/login', '/register'];

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Cek apakah rute saat ini ada di list public
  // Menggunakan startsWith agar rute seperti /products/123 tetap dianggap public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/product/') || pathname.startsWith('/catalog')
  );
  
  const isAuthPage = authRoutes.includes(pathname);

  // LOGIKA 1: Jika akses halaman private tapi tidak punya token
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Simpan URL asal agar setelah login bisa balik lagi (User Experience)
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // LOGIKA 2: Jika sudah login tapi coba buka halaman login/register
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 3. Matcher yang efisien (menghindari static files)
export const config = {
    matcher: [
      /*
       * Match semua request kecuali:
       * 1. api, _next/static, _next/image
       * 2. file di folder public (favicon, dsb)
       * 3. SEMUA file yang memiliki ekstensi (titik) seperti .png, .jpg, .svg
       */
      '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
  };