"use client";

import { AuthForm } from "@/components/auth";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthForm mode="sign-in" />
    </div>
  );
}
