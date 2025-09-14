import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CurrentPlanCard } from "@/components/dashboard/current-plan-card";
import { UserCasesList } from "@/components/dashboard/user-cases-list";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const [subscription, cases] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.case.findMany({
      where: {
        userId: session.user.id,
        status: {
          not: {
            equals: "archived",
          },
        },
      },
      include: {
        summaries: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your legal assistance plan and cases
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
            <div className="lg:col-span-2 flex flex-col">
              <UserCasesList cases={cases} />
            </div>

            <aside className="space-y-6">
              <CurrentPlanCard subscription={subscription} />

              {/* <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/chat"
                    className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors block"
                  >
                    Start New Case
                  </Link>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    Generate Legal Letter
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    AI Legal Assistant
                  </button>
                </div>
              </div> */}

              {/* <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                {cases.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {cases.length} total case{cases.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last updated:{" "}
                      {new Date(cases[0]?.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No cases yet. Start your first case to see activity here.
                  </p>
                )}
              </div> */}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
