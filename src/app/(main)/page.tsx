import { auth } from "@clerk/nextjs/server";
import ChatHome from "@/components/chat/chat-home";
import LandingPage from "@/components/landing/landing-page";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return <LandingPage />;
  }

  return <ChatHome />;
}
