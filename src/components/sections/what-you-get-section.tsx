import { DollarSign, Bot, RotateCcw, Eye, Mail, BarChart } from "lucide-react";

export function WhatYouGetSection() {
  const features = [
    {
      icon: DollarSign,
      title: "Save legal costs",
      description: "Avoid expensive lawyer consultations for simple issues",
    },
    {
      icon: Bot,
      title: "AI legal assistant",
      description: "Get instant answers to your legal questions 24/7",
    },
    {
      icon: RotateCcw,
      title: "No need to repeat yourself",
      description: "Your case details are saved and organized automatically",
    },
    {
      icon: Eye,
      title: "Clarity on where you stand",
      description: "Understand your legal position in plain English",
    },
    {
      icon: Mail,
      title: "Instant draft letters",
      description: "Generate professional legal documents in minutes",
    },
    {
      icon: BarChart,
      title: "Case timeline builder",
      description: "Track important dates and deadlines in one place",
    },
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">
          What you get
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
