import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/auth/user-menu";
import { SignInButton } from "@/components/auth/sign-in-button";
import Link from "next/link";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Legally Bourne
          </Link>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="flex items-center space-x-3">
                <SignInButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
