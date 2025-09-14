"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, MessageSquare, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";

export function FeaturesDeepDiveSection() {
  const router = useRouter();

  const features = [
    {
      icon: FileText,
      title: "Contract Letter Builder",
      description: "Create professional legal documents",
      available: false,
    },
    {
      icon: Clock,
      title: "Deadline Timeline Builder",
      description: "Track important dates and deadlines",
      available: false,
    },
    {
      icon: MessageSquare,
      title: "Quick Chat with AI Assistant",
      description: "Get instant legal guidance 24/7",
      available: true,
    },
    {
      icon: BarChart,
      title: "Dashboard",
      description: "Manage all your legal matters in one place",
      available: true,
    },
  ];

  const handleFeatureClick = (title: string, available: boolean) => {
    if (!available) return;

    match(title)
      .with("Quick Chat with AI Assistant", () => {
        router.push("/chat");
      })
      .with("Dashboard", () => {
        router.push("/dashboard");
      })
      .with("Contract Letter Builder", () => {
        router.push("/contract-builder");
      })
      .with("Deadline Timeline Builder", () => {
        router.push("/timeline-builder");
      })
      .otherwise(() => {
        console.warn(`No navigation defined for feature: ${title}`);
      });
  };

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
              className="border border-blue-400 rounded-lg p-6 bg-blue-500/20 flex flex-col h-full relative"
            >
              {!feature.available && (
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-yellow-900 hover:bg-yellow-500">
                  Coming Soon
                </Badge>
              )}

              <div
                className={`w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                  !feature.available ? "opacity-50" : ""
                }`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3
                className={`text-lg font-semibold text-center mb-2 ${
                  !feature.available ? "opacity-50" : ""
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`text-blue-100 text-sm text-center mb-6 flex-grow ${
                  !feature.available ? "opacity-50" : ""
                }`}
              >
                {feature.description}
              </p>
              <Button
                onClick={() =>
                  handleFeatureClick(feature.title, feature.available)
                }
                disabled={!feature.available}
                variant="outline"
                className={`w-full mt-auto ${
                  feature.available
                    ? "bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                    : "bg-transparent border-gray-400 text-gray-400 cursor-not-allowed opacity-50"
                }`}
              >
                {feature.available ? "Start My Case" : "Coming Soon"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
