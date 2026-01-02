"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { PixelButton } from "./pixel-button";
import { User } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "./auth/user-menu";

export function UserNav() {
  return (
    <>
      <SignedOut>
        <Link href="/sign-in">
          <PixelButton variant="outline" size="sm">
            <User className="w-3 h-3 mr-1" />
            LOGIN
          </PixelButton>
        </Link>
      </SignedOut>
      <SignedIn>
        <UserMenu />
      </SignedIn>
    </>
  );
}
