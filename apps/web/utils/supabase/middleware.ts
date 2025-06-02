import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import {
  protectedRoutes,
  DEFAULT_AUTH_ROUTE,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
} from "../routes";

export const createClient = async (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Get user
  const { data, error } = await supabase.auth.getUser();

  // If protected route and user is not authenticated, redirect to login
  const isProtectedRoute = protectedRoutes.includes(request.nextUrl.pathname);

  if (isProtectedRoute && (error ?? !data.user)) {
    const url = new URL(DEFAULT_AUTH_ROUTE, request.url);
    return NextResponse.redirect(url);
  }

  // Forward authed user to DEFAULT_LOGIN_REDIRECT if auth route
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);

  if (isAuthRoute && data.user) {
    const url = new URL(DEFAULT_LOGIN_REDIRECT, request.url);
    return NextResponse.redirect(url);
  }

  return response;
};
