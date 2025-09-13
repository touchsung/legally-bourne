import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { match } from "ts-pattern";

const PLANS = {
  "pay-per-letter": {
    name: "Pay per letter (One off)",
    amount: 500,
    type: "one_time" as const,
  },
  pro: {
    name: "Pro Plan",
    amount: 1500,
    type: "recurring" as const,
  },
  business: {
    name: "Business / SME Plan",
    amount: 3900,
    type: "recurring" as const,
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email!;
    const { planId } = await request.json();

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    const customer = await match(existingCustomers.data.length)
      .with(0, async () =>
        stripe.customers.create({
          email: userEmail,
          name: user.name || "",
          metadata: {
            userId: user.id || "",
          },
        })
      )
      .otherwise(() => Promise.resolve(existingCustomers.data[0]));

    const sessionConfig = match(plan.type)
      .with("recurring", () => ({
        mode: "subscription" as const,
        subscription_data: {
          metadata: {
            userId: user.id || "",
            planId: planId,
          },
        },
      }))
      .with("one_time", () => ({
        mode: "payment" as const,
      }))
      .exhaustive();

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
            },
            unit_amount: plan.amount,
            recurring:
              plan.type === "recurring"
                ? {
                    interval: "month",
                  }
                : undefined,
          },
          quantity: 1,
        },
      ],
      ...sessionConfig,
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/?canceled=true`,
      metadata: {
        userId: user.id || "",
        planId: planId,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
