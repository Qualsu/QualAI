import { SignIn } from '@clerk/nextjs';
import { Metadata } from 'next';
import "../../style.css"
import { APP_AUTH_TITLE, images, pages } from '@/config';

export const metadata: Metadata = {
  title: APP_AUTH_TITLE,
  description: "SignIn",
  icons: {
    icon: images.QUAL_ID_ICON,
  }
};

export default function SiginInPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <SignIn fallbackRedirectUrl={pages.ROOT} forceRedirectUrl={pages.ROOT} />
      <div id='clerk-captcha' />
    </main>
  );
}