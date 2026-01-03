"use client";

import { AuthForm } from "@/components/auth";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthForm mode="sign-up" />
    </div>
  );
}
