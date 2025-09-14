import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  const benefits = [
    "Free to start",
    "No legal knowledge needed",
    "AI-powered guidance",
    "Built for real people, not lawyers",
  ];

  return (
    <div className="bg-blue-600 py-20 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Need Help with a Legal Issue?
        </h1>

        <p className="text-lg mb-8 opacity-90">No Lawyer? No Problem</p>
        <Link href="chat">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold mb-12 rounded-full"
          >
            Start My Case
          </Button>
        </Link>

        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center justify-center space-x-2"
            >
              <span className="text-green-300">✓</span>
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
