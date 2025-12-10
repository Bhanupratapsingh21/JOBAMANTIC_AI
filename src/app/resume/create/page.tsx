"use client";

import { Suspense, useEffect } from "react";
import ResumeBuilder from "@/components/ResumeBuilder";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(()=>{
    if (!user){
      router.push("/auth/Signin");
    }
  },[user,router])
  return (
    <Suspense fallback={<div>Loading resume builder...</div>}>
      <ResumeBuilder />
    </Suspense>
  );
}
