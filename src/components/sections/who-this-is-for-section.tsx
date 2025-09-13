import { Users, Home, Building, HelpCircle } from "lucide-react";

export function WhoThisIsForSection() {
  const categories = [
    {
      icon: Users,
      title: "Freelancers & Gig workers",
      description: "Get help recovering unpaid invoices and project fees",
    },
    {
      icon: Home,
      title: "Tenants & everyday renters",
      description: "Navigate deposit disputes, repairs, and lease issues",
    },
    {
      icon: Building,
      title: "Small business & SME owners",
      description:
        "Create contracts, handle disputes, and protect your business",
    },
    {
      icon: HelpCircle,
      title: "Individuals with personal legal issues",
      description: "Get clarity on your rights and next steps forward",
    },
  ];

  return (
    <div className="py-16 bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold mb-4">Who is this for</h2>
          <div className="flex items-center justify-center space-x-4 text-sm mb-12">
            <span>Made for everyday legal struggles</span>
            <span>•</span>
            <span>Built for real people, not just lawyers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="border border-blue-400 rounded-lg p-6 bg-blue-500/20"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {category.title}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
