/* eslint-disable react-compiler/react-compiler */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ReferralHandler() {
  const { isSignedIn, isLoaded } = useAuth();
  const applyCode = useMutation(api.referrals.applyReferralCode);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasChecked) return;

    const storedCode = localStorage.getItem("vibebuff_referral_code");
    if (storedCode) {
      applyCode({ code: storedCode })
        .then((result) => {
          if (result.success) {
            localStorage.removeItem("vibebuff_referral_code");
          }
        })
        .catch(() => {
        })
        .finally(() => {
          setHasChecked(true);
        });
    } else {
      setHasChecked(true);
    }
  }, [isLoaded, isSignedIn, hasChecked, applyCode]);

  return null;
}
