"use client";

import { caseTypes } from "@/data/case-types";

interface QuickReference {
  question: string;
  category: string;
}

interface QuickReferencesProps {
  selectedCaseType: string;
  onQuestionSelect: (question: string) => void;
  isVisible: boolean;
}

const getQuickReferences = (caseTypeId: string): QuickReference[] => {
  switch (caseTypeId) {
    case "housing-tenancy":
      return [
        {
          question:
            "My landlord is refusing to return my security deposit. What can I do?",
          category: "Deposit Issues",
        },
        {
          question: "Can my landlord evict me without proper notice?",
          category: "Eviction",
        },
        {
          question:
            "My rental contract has unfair terms. Are they legally binding?",
          category: "Contract Terms",
        },
        {
          question:
            "The landlord isn't fixing urgent repairs. What are my rights?",
          category: "Maintenance",
        },
        {
          question: "Can I break my lease early without penalties?",
          category: "Lease Breaking",
        },
        {
          question:
            "My landlord is harassing me. What legal protection do I have?",
          category: "Harassment",
        },
      ];

    case "employment-workplace":
      return [
        {
          question:
            "My employer is refusing to accept my resignation. Is this legal?",
          category: "Resignation",
        },
        {
          question: "I haven't received my salary for 3 months. What can I do?",
          category: "Unpaid Wages",
        },
        {
          question: "How do I file a complaint with MOHRE?",
          category: "MOHRE Complaint",
        },
        {
          question:
            "My employer is not paying my gratuity. What are my rights?",
          category: "End of Service",
        },
        {
          question: "Can my employer terminate me without notice?",
          category: "Termination",
        },
        {
          question:
            "I'm facing workplace discrimination. Where can I get help?",
          category: "Discrimination",
        },
      ];

    case "loans-financial":
      return [
        {
          question: "I can't pay my credit card debt. What are my options?",
          category: "Debt Management",
        },
        {
          question: "The bank is threatening legal action. What should I do?",
          category: "Legal Threats",
        },
        {
          question: "I have a travel ban due to debt. How can I resolve this?",
          category: "Travel Ban",
        },
        {
          question: "Can I negotiate a payment plan with my bank?",
          category: "Payment Plans",
        },
        {
          question: "What happens if I default on my personal loan?",
          category: "Loan Default",
        },
        {
          question: "How can I check if I have any outstanding debts?",
          category: "Debt Check",
        },
      ];

    case "visa-immigration":
      return [
        {
          question: "I overstayed my visa. What are the consequences?",
          category: "Overstay",
        },
        {
          question: "My visa was cancelled by my employer. What can I do?",
          category: "Visa Cancellation",
        },
        {
          question: "I have a medical ban. How can I lift it?",
          category: "Medical Ban",
        },
        { question: "How do I apply for an exit pass?", category: "Exit Pass" },
        {
          question: "Can I change my visa status while in the country?",
          category: "Status Change",
        },
        {
          question: "What documents do I need for visa renewal?",
          category: "Visa Renewal",
        },
      ];

    case "criminal-civil":
      return [
        {
          question: "I've been accused of breach of trust. What should I do?",
          category: "Breach of Trust",
        },
        {
          question: "How do I file an appeal against a court decision?",
          category: "Appeals",
        },
        {
          question: "Can I apply for a mercy memorandum?",
          category: "Mercy Application",
        },
        {
          question: "What's the difference between civil and criminal cases?",
          category: "Case Types",
        },
        {
          question: "I received a court summons. What are the next steps?",
          category: "Court Proceedings",
        },
        {
          question: "How can I settle a dispute out of court?",
          category: "Settlement",
        },
      ];

    case "client-non-payment":
      return [
        {
          question:
            "My client hasn't paid my invoice. What legal actions can I take?",
          category: "Payment Recovery",
        },
        {
          question: "How do I send a formal demand letter?",
          category: "Demand Letter",
        },
        {
          question: "Can I charge interest on overdue payments?",
          category: "Interest Charges",
        },
        {
          question: "What evidence do I need to prove work completion?",
          category: "Evidence",
        },
        {
          question: "Is it worth taking legal action for small amounts?",
          category: "Cost Analysis",
        },
        {
          question: "How can I prevent non-payment in future contracts?",
          category: "Prevention",
        },
      ];

    case "consumer-ecommerce":
      return [
        {
          question:
            "I bought a defective product online. How do I get a refund?",
          category: "Refunds",
        },
        {
          question: "A seller is refusing to deliver my order. What can I do?",
          category: "Non-delivery",
        },
        {
          question:
            "I think I'm a victim of online fraud. Where do I report it?",
          category: "Online Fraud",
        },
        {
          question:
            "The product doesn't match the description. What are my rights?",
          category: "Misrepresentation",
        },
        {
          question: "How do I dispute a credit card charge?",
          category: "Chargebacks",
        },
        {
          question: "Can I return products bought online?",
          category: "Return Policy",
        },
      ];

    default: // 'other'
      return [
        {
          question: "I need help with a contract dispute. Where do I start?",
          category: "Contracts",
        },
        {
          question: "How do I find the right lawyer for my case?",
          category: "Legal Representation",
        },
        {
          question: "What documents should I prepare for my legal case?",
          category: "Documentation",
        },
        {
          question: "Can I represent myself in court?",
          category: "Self-Representation",
        },
        {
          question: "How much do legal proceedings typically cost?",
          category: "Legal Costs",
        },
        {
          question: "What's the difference between mediation and litigation?",
          category: "Dispute Resolution",
        },
      ];
  }
};

export function QuickReferences({
  selectedCaseType,
  onQuestionSelect,
  isVisible,
}: QuickReferencesProps) {
  if (!isVisible) return null;

  const questions = getQuickReferences(selectedCaseType);

  return (
    <div className="mb-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Quick References
        </h3>
        <div className="space-y-2">
          {questions.map((ref, index) => (
            <button
              key={index}
              onClick={() => onQuestionSelect(ref.question)}
              className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm text-gray-700 hover:text-blue-700"
            >
              {ref.question}
            </button>
          ))}
        </div>
        {/* 
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">
            Or explore these services:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                onQuestionSelect("I need help drafting a legal letter")
              }
              className="p-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              📄 Legal Letter
            </button>
            <button
              onClick={() =>
                onQuestionSelect("I need to create a timeline for my case")
              }
              className="p-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              📅 Case Timeline
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
