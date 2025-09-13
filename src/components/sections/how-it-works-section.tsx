import { Search, FileEdit, Shield } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: "Pick Your Issue",
    },
    {
      number: 2,
      icon: FileEdit,
      title: "Answer a few questions",
    },
    {
      number: 3,
      icon: Shield,
      title: "Get guide help or legal draft",
    },
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-blue-500 mb-16">
          How it Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-end">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className="bg-blue-50 w-32 h-32 rounded-3xl flex items-center justify-center mb-8">
                <step.icon
                  className="w-16 h-16 text-gray-800"
                  strokeWidth={1.5}
                />
              </div>

              <div className="border border-blue-400 rounded-full px-6 py-3 mb-6 bg-white h-16 flex items-center justify-center w-80">
                <span className="text-base font-medium text-gray-800 text-center leading-tight">
                  {step.title}
                </span>
              </div>

              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {step.number}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
