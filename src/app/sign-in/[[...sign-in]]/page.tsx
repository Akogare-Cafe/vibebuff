"use client";

import { AuthForm } from "@/components/auth";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <AuthForm mode="sign-in" />
    </div>
  );
}
