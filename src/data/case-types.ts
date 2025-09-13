import {
  Home,
  Building,
  CreditCard,
  Plane,
  Scale,
  FileText,
  ShoppingCart,
  HelpCircle,
} from "lucide-react";

export const caseTypes = [
  {
    id: "housing-tenancy",
    icon: Home,
    title: "Housing & Tenancy",
    description:
      "Rental disputes, deposit issues, eviction, amunde rent rent cheques",
  },
  {
    id: "employment-workplace",
    icon: Building,
    title: "Employment & Workplace",
    description: "Resignation rejected, unpaid wages gratuity—MOHRE complaints",
  },
  {
    id: "loans-financial",
    icon: CreditCard,
    title: "Loans & Financial",
    description:
      "Bank loans, credit cards, overdue settlement, travel bans from debt",
  },
  {
    id: "visa-immigration",
    icon: Plane,
    title: "Visa & Immigration",
    description:
      "Medical ban, overstay fines, visa cancellation, exit pass/deportation court-related travel ban",
  },
  {
    id: "criminal-civil",
    icon: Scale,
    title: "Criminal & Civil Cases",
    description: "Breach of trust, misdemeanour, appeal, mercy memorandum",
  },
  {
    id: "client-non-payment",
    icon: FileText,
    title: "Client Non-Payment",
    description: "You completed work, but haven't been paid",
  },
  {
    id: "consumer-ecommerce",
    icon: ShoppingCart,
    title: "Consumer & E-Commerce",
    description: "Online orders, refunds, scams, defective products",
  },
  {
    id: "other",
    icon: HelpCircle,
    title: "Other",
    description: "Describe your specific legal issue",
  },
];
