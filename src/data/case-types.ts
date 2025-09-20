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

export const casePlaceholders: Record<string, string> = {
  "divorce-custody":
    "Start by describing your issue… e.g. 'I want to file for divorce and need help with custody arrangements.'",
  "child-support":
    "Start by describing your issue… e.g. 'My ex-spouse is not paying child support as agreed in our divorce settlement.'",
  "inheritance-estate":
    "Start by describing your issue… e.g. 'My father passed away and there are disputes over his will and property distribution.'",
  "housing-tenancy":
    "Start by describing your issue… e.g. 'My landlord refused to return my deposit after I moved out.'",
  "property-disputes":
    "Start by describing your issue… e.g. 'My neighbor is building on my property boundary without permission.'",
  "car-accident":
    "Start by describing your issue… e.g. 'I was in a car accident but my insurance company has not paid my claim.'",
  "medical-malpractice":
    "Start by describing your issue… e.g. 'I received improper medical treatment that caused me harm.'",
  "product-liability":
    "Start by describing your issue… e.g. 'A defective product I purchased caused me injury or damage.'",
  "consumer-rights":
    "Start by describing your issue… e.g. 'I ordered a product online but it arrived damaged and the seller refused to refund me.'",
  "ecommerce-disputes":
    "Start by describing your issue… e.g. 'The online seller sent me a fake item and won't accept my return.'",
  "employment-workplace":
    "Start by describing your issue… e.g. 'I worked for 2 months but my employer has not paid my salary.'",
  "wrongful-termination":
    "Start by describing your issue… e.g. 'My employer fired me without notice or valid reason.'",
  "workplace-harassment":
    "Start by describing your issue… e.g. 'I am experiencing discrimination and harassment at work.'",
  "client-non-payment":
    "Start by describing your issue… e.g. 'I completed a design project for a client but they have not paid me yet.'",
  "freelance-disputes":
    "Start by describing your issue… e.g. 'I hired a freelancer on Upwork, paid 50%, but no work was delivered.'",
  "loans-financial":
    "Start by describing your issue… e.g. 'I took a bank loan but now they are charging me unfair penalties.'",
  "credit-card-debt":
    "Start by describing your issue… e.g. 'I cannot pay my credit card debt and the bank is threatening legal action.'",
  "business-disputes":
    "Start by describing your issue… e.g. 'My business partner is not honoring our shareholder agreement.'",
  "contract-breach":
    "Start by describing your issue… e.g. 'A supplier failed to deliver goods as per our signed contract.'",
  "visa-immigration":
    "Start by describing your issue… e.g. 'My UAE visa expired but my employer has not renewed it yet.'",
  "overstay-fines":
    "Start by describing your issue… e.g. 'I overstayed my visa and need help resolving the fines and penalties.'",
  "criminal-civil":
    "Start by describing your issue… e.g. 'I was charged with a traffic violation and need help appealing the fine.'",
  "appeals-mercy":
    "Start by describing your issue… e.g. 'I received a court judgment and want to file an appeal.'",
  other:
    "Start by describing your issue… e.g. 'I have a legal problem that does not fit into the listed categories.'",
};
