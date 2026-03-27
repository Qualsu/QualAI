"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"
import Image from "next/image";

export default function Error404() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen">
        <div className="flex items-center justify-center flex-col gap-4">
            <Image src="/mini-logo.svg" width={120} height={28} alt="Qual AI mini logo" className="object-contain grayscale-100" />
            <h1 className="text-bold text-xl">Страница не найдена</h1>
            <Button onClick={() => router.push("/")} variant={"outline"}>На главную</Button>
        </div>
    </div>
  )
}
