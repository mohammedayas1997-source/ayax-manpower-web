import { NextResponse } from 'next/server';

export async function GET(request) {
  // 1. Saita adireshin da za a tura mutum bayan ya fita
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  // 2. Kwashe dukkan cookies da ke cikin burawza (ciki har da na Supabase)
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