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
  HelpCircle,
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
  {
    id: "other",
    title: "Other",
    icon: HelpCircle,
    types: [
      {
        id: "other",
        icon: HelpCircle,
        title: "Other",
        description: "Describe your specific legal issue",
      },
    ],
  },
];

export const caseTypes = caseGroups.flatMap((group) => group.types);
