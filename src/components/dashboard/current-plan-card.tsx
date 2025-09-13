"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, Zap, Building, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  planId: string;
  status: string;
  stripeSubscriptionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CurrentPlanCardProps {
  subscription: Subscription | null;
}

export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const getPlanDetails = (planId: string | null) => {
    switch (planId) {
      case "pay-per-letter":
        return {
          name: "Pay per letter (One off)",
          price: "$5",
          icon: Zap,
          color: "bg-orange-500",
          isRecurring: false,
          features: [
            { text: "Generate 1 legal letter", included: true },
            { text: "No case timeline", included: false },
            { text: "No AI chat assistant", included: false },
            { text: "No dashboard save", included: false },
          ],
        };
      case "pro":
        return {
          name: "Pro Plan",
          price: "$15/mo",
          icon: Crown,
          color: "bg-blue-500",
          isRecurring: true,
          features: [
            { text: "Unlimited Cases", included: true },
            { text: "Timeline Builder", included: true },
            { text: "Unlimited letter", included: true },
            { text: "Unlimited AI assistant", included: true },
            { text: "Secure storage", included: true },
            { text: "Export Timeline", included: true },
          ],
        };
      case "business":
        return {
          name: "Business / SME Plan",
          price: "$39/mo",
          icon: Building,
          color: "bg-purple-500",
          isRecurring: true,
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
        };
      default:
        return {
          name: "Free Forever",
          price: "$0",
          icon: Check,
          color: "bg-green-500",
          isRecurring: false,
          features: [
            { text: "Basic template", included: true },
            { text: "1 case in dashboard", included: true },
            { text: "Limited AI Q&A", included: true },
          ],
        };
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Canceled
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Past Due
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Free
          </Badge>
        );
    }
  };

  const handleSubscriptionAction = async (action: string) => {
    setLoading(action);

    try {
      const response = await fetch("/api/stripe/manage-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to manage subscription");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.success(data.message || "Subscription updated successfully");
        window.location.reload();
      }
    } catch (error) {
      console.error("Subscription action error:", error);
      toast.error("Failed to update subscription");
    } finally {
      setLoading(null);
    }
  };

  const planDetails = getPlanDetails(subscription?.planId || null);
  const Icon = planDetails.icon;
  const isRecurringPlan =
    planDetails.isRecurring && subscription?.stripeSubscriptionId;

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${planDetails.color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{planDetails.name}</CardTitle>
              <CardDescription className="text-lg font-semibold text-gray-900">
                {planDetails.price}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(subscription?.status || null)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
          <ul className="space-y-2">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                {feature.included ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {subscription && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Subscription Details
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Started: {new Date(subscription.createdAt).toLocaleDateString()}
              </p>
              <p>
                Last updated:{" "}
                {new Date(subscription.updatedAt).toLocaleDateString()}
              </p>
              {isRecurringPlan && (
                <p className="text-blue-600 font-medium">
                  Auto-renewal:{" "}
                  {subscription.status === "active" ? "Enabled" : "Disabled"}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-4 border-t">
          {!subscription || subscription.planId === null ? (
            <Link href="/#pricing" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Upgrade Plan
              </Button>
            </Link>
          ) : (
            <>
              {isRecurringPlan && (
                <Button
                  variant="outline"
                  onClick={() => handleSubscriptionAction("manage")}
                  disabled={loading === "manage"}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {loading === "manage" ? "Loading..." : "Manage Billing"}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
