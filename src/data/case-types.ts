import {
  Users,
  Home,
  Car,
  ShoppingCart,
  Building,
  FileText,
  Laptop,
  CreditCard,
  Building2,
  Plane,
  Scale,
  User,
  Briefcase,
  Globe,
} from "lucide-react";

export const caseGroups = [
  {
    id: "personal-family",
    title: "Personal & Family",
    icon: User,
    types: [
      {
        id: "family-personal",
        icon: Users,
        title: "Family & Personal",
        description: "Divorce, custody, inheritance",
      },
      {
        id: "housing-tenancy",
        icon: Home,
        title: "Housing & Tenancy",
        description: "Rental disputes, deposits, rent issues",
      },
      {
        id: "accident-insurance",
        icon: Car,
        title: "Accident & Insurance",
        description: "Accidents, insurance claims",
      },
      {
        id: "consumer-ecommerce",
        icon: ShoppingCart,
        title: "Consumer & E-Commerce",
        description: "Online orders, refunds, scams",
      },
    ],
  },
  {
    id: "work-money",
    title: "Work & Money",
    icon: Briefcase,
    types: [
      {
        id: "employment-workplace",
        icon: Building,
        title: "Employment & Workplace",
        description: "Unpaid wages, termination, complaints",
      },
      {
        id: "client-non-payment",
        icon: FileText,
        title: "Client Non-Payment",
        description: "Completed work but not paid",
      },
      {
        id: "freelance-platform",
        icon: Laptop,
        title: "Freelance / Platform Disputes",
        description: "Upwork, Fiverr, Freelancer.com issues",
      },
      {
        id: "loans-financial",
        icon: CreditCard,
        title: "Loans & Financial",
        description: "Bank loans, credit cards, overdue payments",
      },
    ],
  },
  {
    id: "business-corporate",
    title: "Business & Corporate",
    icon: Building2,
    types: [
      {
        id: "business-corporate",
        icon: Building2,
        title: "Business & Corporate",
        description: "Partnerships, contracts, IP, SME disputes",
      },
    ],
  },
  {
    id: "government-legal",
    title: "Government & Legal",
    icon: Globe,
    types: [
      {
        id: "visa-immigration",
        icon: Plane,
        title: "Visa & Immigration",
        description: "Visa cancellation, overstay, travel bans",
      },
      {
        id: "criminal-civil",
        icon: Scale,
        title: "Criminal & Civil Cases",
        description: "Criminal charges, civil disputes, appeals",
      },
    ],
  },
];

export const caseTypes = caseGroups.flatMap((group) => group.types);

export const casePlaceholders: Record<string, string> = {
  "family-personal":
    "Describe your family or personal legal issue (e.g., 'I want to file for divorce' or 'There's a dispute over inheritance')...",
  "housing-tenancy":
    "Describe your housing or tenancy issue (e.g., 'My landlord refused to return my deposit' or 'I'm facing eviction')...",
  "accident-insurance":
    "Describe your accident or insurance issue (e.g., 'I was in a car accident and need help with my claim')...",
  "consumer-ecommerce":
    "Describe your consumer or e-commerce issue (e.g., 'I ordered online but received a fake product')...",
  "employment-workplace":
    "Describe your employment issue (e.g., 'My employer hasn't paid my salary for 2 months' or 'I was fired without notice')...",
  "client-non-payment":
    "Describe the non-payment issue (e.g., 'I completed the work but client refuses to pay')...",
  "freelance-platform":
    "Describe your freelance platform issue (e.g., 'Client on Upwork didn't pay after I delivered the project')...",
  "loans-financial":
    "Describe your loan or financial issue (e.g., 'I can't pay my credit card debt' or 'Bank is charging unfair penalties')...",
  "business-corporate":
    "Describe your business issue (e.g., 'Partner isn't honoring our agreement' or 'Contract dispute with supplier')...",
  "visa-immigration":
    "Describe your visa or immigration issue (e.g., 'My visa was cancelled by employer' or 'I overstayed my visa')...",
  "criminal-civil":
    "Describe your case (e.g., 'I need help with a court appeal' or 'I was charged with a crime I didn't commit')...",
};
