import { DollarSign, Shield, Headphones } from "lucide-react";

export function TrustIndicatorsSection() {
  const indicators = [
    {
      icon: DollarSign,
      title: "No hidden fees",
      description: "Transparent pricing with no surprises",
    },
    {
      icon: Shield,
      title: "Your info is safe",
      description: "Bank-level security for your personal data",
    },
    {
      icon: Headphones,
      title: "AI guidance, help if stuck",
      description: "Smart assistance with human support when needed",
    },
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {indicators.map((indicator, index) => (
            <div key={index} className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <indicator.icon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {indicator.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {indicator.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
