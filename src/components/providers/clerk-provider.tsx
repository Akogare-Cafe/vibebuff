"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ClerkClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#000000",
          colorInputBackground: "#0a1628",
          colorInputText: "#60a5fa",
          colorText: "#60a5fa",
          colorTextSecondary: "#3b82f6",
          borderRadius: "0px",
        },
        elements: {
          card: "border-4 border-[#1e3a5f] bg-[#000000]",
          headerTitle: "text-[#60a5fa]",
          headerSubtitle: "text-[#3b82f6]",
          formButtonPrimary: "bg-[#3b82f6] hover:bg-[#60a5fa] text-[#000000] border-4 border-[#1e3a5f]",
          formFieldInput: "border-4 border-[#1e3a5f] bg-[#0a1628] text-[#60a5fa]",
          footerActionLink: "text-[#3b82f6] hover:text-[#60a5fa]",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
