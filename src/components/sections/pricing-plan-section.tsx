// src/components/sections/pricing-plan-section.tsx
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function PricingPlanSection() {
  const plans = [
    {
      title: "Free Forever",
      price: "$0",
      subtitle: "",
      features: [
        { text: "Basic template", included: true },
        { text: "1 case in dashboard", included: true },
        { text: "Limited AI Q&A", included: true },
      ],
      buttonText: "Choose",
      highlighted: false,
      cancelAnytime: false,
    },
    {
      title: "Pay per letter (One off)",
      price: "$5/mo",
      subtitle: "Perfect if you just need one letter, no subscription.",
      features: [
        { text: "Generate 1 legal letter", included: true },
        { text: "No case timeline", included: false },
        { text: "No AI chat assistant", included: false },
        { text: "No dashboard save", included: false },
      ],
      buttonText: "Get My Letter",
      highlighted: false,
      cancelAnytime: false,
    },
    {
      title: "Pro",
      price: "$15/mo",
      subtitle: "",
      features: [
        { text: "Unlimited Cases", included: true },
        { text: "Timeline Builder", included: true },
        { text: "Unlimited letter", included: true },
        { text: "Unlimited AI assistant", included: true },
        { text: "Secure storage", included: true },
        { text: "Export Timeline", included: true },
      ],
      buttonText: "Choose",
      highlighted: false,
      cancelAnytime: true,
    },
    {
      title: "Business / SME",
      price: "$39/mo",
      subtitle: "",
      features: [
        { text: "Unlimited Cases", included: true },
        { text: "Timeline Builder", included: true },
        { text: "Unlimited Letter", included: true },
        { text: "Team Access", included: true },
        { text: "Evidence Vault", included: true },
        { text: "SME Templates", included: true },
        { text: "Export Timeline", included: true },
        { text: "Secure storage", included: true },
      ],
      buttonText: "Choose",
      highlighted: false,
      cancelAnytime: true,
    },
  ];

  return (
    <div className="py-16 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Pricing Plan</h2>
          <p className="text-blue-100 text-lg">
            Choose the plan that fits your need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white text-gray-900 rounded-2xl p-6 flex flex-col shadow-lg"
              style={{ minHeight: "500px" }}
            >
              <div className="text-center mb-6">
                <div className="h-16 flex items-center justify-center">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight text-center">
                    {plan.title}
                  </h3>
                </div>
                <div className="text-4xl font-bold text-blue-500 mb-2">
                  {plan.price}
                </div>
                <div className="h-12 flex items-center justify-center">
                  {plan.subtitle && (
                    <p className="text-xs text-gray-600 leading-tight text-center">
                      {plan.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4">
                <Button
                  className="w-full mb-3 bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full py-3"
                  variant="outline"
                >
                  {plan.buttonText}
                </Button>

                <div className="h-6 flex items-center justify-center">
                  {plan.cancelAnytime && (
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-600">
                        Cancel anytime
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
