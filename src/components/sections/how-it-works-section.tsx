import { MessageCircle, HelpCircle, FileText } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: MessageCircle,
      title: "Pick your issue",
      description: "Tell us what's happening in plain English",
    },
    {
      icon: HelpCircle,
      title: "Answer a few questions",
      description: "We'll guide you through the details we need",
    },
    {
      icon: FileText,
      title: "Get guided help or draft",
      description: "Receive personalized legal documents and next steps",
    },
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600">
            Get legal help in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
