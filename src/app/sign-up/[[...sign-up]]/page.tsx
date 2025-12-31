"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-[#1e3a5f] p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[#3b82f6]" />
            <h1 className="text-[#60a5fa] text-sm pixel-glow">VIBEBUFF</h1>
          </Link>
        </div>
      </header>

      {/* Sign Up Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-[#60a5fa] text-sm mb-6">CREATE YOUR ACCOUNT</h2>
          <SignUp 
            afterSignUpUrl="/"
            signInUrl="/sign-in"
          />
        </div>
      </main>
    </div>
  );
}
