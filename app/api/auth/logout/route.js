import { NextResponse } from 'next/server';

export async function GET(request) {
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  // Obliterate all Supabase and authentication session cookies
  const allCookies = request.cookies.getAll();
  allCookies.forEach((cookie) => {
    response.cookies.delete(cookie.name);
    response.cookies.set(cookie.name, '', {
      path: '/',
      expires: new Date(0),
    });
  });

  return response;
}