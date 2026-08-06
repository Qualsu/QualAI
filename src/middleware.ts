import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

import { pages } from './config';

const isPublicRoute = createRouteMatcher([
  `${pages.AUTH.SIGN_IN}(.*)`,
  `${pages.AUTH.SIGN_UP}(.*)`,
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return
  }

  await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}