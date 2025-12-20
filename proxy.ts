// proxy.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // ถ้าเข้าถึงหน้า login แล้วมี token อยู่ในคุกกี้ ให้ redirect ไปหน้าหลัก
  if (pathname === '/login') {
    if(token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // ถ้าไม่มี token ให้เข้าถึงหน้า login ได้ตามปกติ
    return NextResponse.next()
  }
  
  // เช็คว่ามี token ในคุกกี้หรือไม่ ถ้าไม่มีให้ redirect ไปหน้า login
  if (!token) {
    console.log('No token found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match ทุก path ยกเว้น:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ]
}