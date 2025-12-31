"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { PixelButton } from "./pixel-button";
import { User } from "lucide-react";

export function UserNav() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <PixelButton variant="outline" size="sm">
            <User className="w-3 h-3 mr-1" />
            LOGIN
          </PixelButton>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 border-2 border-[#3b82f6]",
            },
          }}
        />
      </SignedIn>
    </>
  );
}
