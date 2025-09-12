import { auth } from "@/lib/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserProfile } from "@/components/auth/user-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Legally Bourne
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your trusted legal companion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {session?.user ? (
              <UserProfile user={session.user} />
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    Sign in to access your legal dashboard
                  </p>
                </div>
                <SignInButton />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
