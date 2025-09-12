// src/components/auth/user-profile.tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, User, Mail, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UserProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      toast.loading("Signing you out...", { id: "sign-out" });

      await signOut({
        callbackUrl: "/",
        redirect: true,
      });

      toast.success("Successfully signed out!", { id: "sign-out" });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.", { id: "sign-out" });
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="mb-2">
          ✅ Authenticated
        </Badge>
        <h2 className="text-xl font-semibold text-slate-900">Welcome back!</h2>
        <p className="text-sm text-slate-600">{formatDate()}</p>
      </div>

      <Separator />

      {/* User Info */}
      <div className="flex items-start space-x-4">
        <Avatar className="h-16 w-16 ring-2 ring-slate-200">
          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-900">
                {user.name || "No name provided"}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">
                {user.email || "No email provided"}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">Signed in today</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-900">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" className="justify-start h-9">
            📋 View Dashboard
          </Button>
          <Button variant="outline" className="justify-start h-9">
            📄 My Documents
          </Button>
          <Button variant="outline" className="justify-start h-9">
            ⚖️ Legal Services
          </Button>
        </div>
      </div>

      <Separator />

      {/* Sign Out */}
      <Button
        onClick={handleSignOut}
        disabled={isSigningOut}
        variant="ghost"
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
