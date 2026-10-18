import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);

  // 1. Goge duk wani nau'in cookie na Supabase
  const allCookies = request.cookies.getAll();
  allCookies.forEach((cookie) => {
    response.cookies.delete(cookie.name);
  });

  return response;
}