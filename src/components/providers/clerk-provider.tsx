"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ClerkClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#7f13ec",
          colorBackground: "#191022",
          colorInputBackground: "#191022",
          colorInputText: "#7f13ec",
          colorText: "#7f13ec",
          colorTextSecondary: "#7f13ec",
          borderRadius: "0px",
        },
        elements: {
          card: "border-4 border-border bg-background",
          headerTitle: "text-primary",
          headerSubtitle: "text-muted-foreground",
          formButtonPrimary: "bg-primary hover:bg-primary text-background border-4 border-border",
          formFieldInput: "border-4 border-border bg-[#191022] text-primary",
          footerActionLink: "text-muted-foreground hover:text-primary",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
