import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { pages } from './config';

const isPublicRoute = createRouteMatcher([
  pages.ROOT,
  `${pages.LANDING}(.*)`,
  `${pages.AUTH.SIGN_IN}(.*)`,
  `${pages.AUTH.SIGN_UP}(.*)`,
  '/manifest.json',
  '/sw.js',
  '/(.*)\\.png$',
  '/(.*)\\.ico$',
  '/(.*)\\.json$',
]);

const isLandingRoute = createRouteMatcher([
  `${pages.LANDING}(.*)`,
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (userId && isLandingRoute(req)) {
    return NextResponse.redirect(new URL(pages.ROOT, req.url));
  }

  if (isPublicRoute(req)) {
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};