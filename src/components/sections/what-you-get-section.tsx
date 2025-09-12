import {
  DollarSign,
  Bot,
  RotateCcw,
  Eye,
  FileText,
  Calendar,
} from "lucide-react";

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
      icon: FileText,
      title: "Instant draft letters",
      description: "Generate professional legal documents in minutes",
    },
    {
      icon: Calendar,
      title: "Case timeline builder",
      description: "Track important dates and deadlines in one place",
    },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What you get
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to handle legal issues confidently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
