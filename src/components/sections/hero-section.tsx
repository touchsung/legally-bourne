import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function HeroSection() {
  const benefits = [
    "Free to start",
    "No legal knowledge needed",
    "AI-powered guidance",
    "Built for real people, not lawyers",
  ];

  return (
    <div className="bg-gradient-to-r from-sky-400 to-blue-500 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Need help with a legal issue?
        </h1>

        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          No lawyer? No problem.
        </p>

        <Button
          size="lg"
          className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold mb-16"
        >
          Start My Case
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center justify-center space-x-3"
            >
              <Check className="h-6 w-6 text-white flex-shrink-0 mt-0.5" />
              <span className="text-white font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
