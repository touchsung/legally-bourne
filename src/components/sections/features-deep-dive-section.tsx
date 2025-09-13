import { Button } from "@/components/ui/button";
import { FileText, Clock, MessageSquare, BarChart } from "lucide-react";

export function FeaturesDeepDiveSection() {
  const features = [
    {
      icon: FileText,
      title: "Contract Letter Builder",
      description: "Create professional legal documents",
    },
    {
      icon: Clock,
      title: "Deadline Timeline Builder",
      description: "Track important dates and deadlines",
    },
    {
      icon: MessageSquare,
      title: "Quick Chat with AI Assistant",
      description: "Get instant legal guidance 24/7",
    },
    {
      icon: BarChart,
      title: "Dashboard",
      description: "Manage all your legal matters in one place",
    },
  ];

  return (
    <div className="py-16 bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Features / Product Deep Dive
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border border-blue-400 rounded-lg p-6 bg-blue-500/20 flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">
                {feature.title}
              </h3>
              <p className="text-blue-100 text-sm text-center mb-6 flex-grow">
                {feature.description}
              </p>
              <Button
                variant="outline"
                className="w-full bg-transparent border-white text-white hover:bg-white hover:text-blue-600 mt-auto"
              >
                Start My Case
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
