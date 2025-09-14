"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      toast.loading("Signing you in...", { id: "sign-in" });

      await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });

      toast.success("Successfully signed in!", { id: "sign-in" });
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.", { id: "sign-in" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
    >
      {isLoading ? "Signing in..." : "Sign in"}
    </Button>
  );
}
