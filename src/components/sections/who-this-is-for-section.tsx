import { Users, Home, Building, Info } from "lucide-react";

export function WhoThisIsForSection() {
  const targetAudiences = [
    {
      icon: Users,
      title: "Freelancers who haven't been paid",
      description: "Get help recovering unpaid invoices and project fees",
    },
    {
      icon: Home,
      title: "Tenants who have landlord problems",
      description: "Navigate deposit disputes, repairs, and lease issues",
    },
    {
      icon: Building,
      title: "Small business owners who need document help",
      description:
        "Create contracts, handle disputes, and protect your business",
    },
    {
      icon: Info,
      title: "People who feel stuck with legal issues",
      description: "Get clarity on your rights and next steps forward",
    },
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Who this is for
          </h2>
          <p className="text-xl text-gray-600">
            Legal help designed for everyday situations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {targetAudiences.map((audience, index) => (
            <div key={index} className="flex items-start space-x-4 p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                <audience.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {audience.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {audience.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
