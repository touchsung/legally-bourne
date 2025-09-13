import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { match, P } from "ts-pattern";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    );

    await match(event.type)
      .with("checkout.session.completed", async () => {
        const session = event.data.object as Stripe.Checkout.Session;
        return handleCheckoutCompleted(session);
      })
      .with("customer.subscription.created", async () => {
        const subscription = event.data.object as Stripe.Subscription;
        return handleSubscriptionCreated(subscription);
      })
      .with("customer.subscription.updated", async () => {
        const subscription = event.data.object as Stripe.Subscription;
        return handleSubscriptionUpdated(subscription);
      })
      .with("customer.subscription.deleted", async () => {
        const subscription = event.data.object as Stripe.Subscription;
        return handleSubscriptionDeleted(subscription);
      })
      .with("invoice.payment_succeeded", async () => {
        const invoice = event.data.object as Stripe.Invoice;
        return handleInvoicePaymentSucceeded(invoice);
      })
      .with("invoice.payment_failed", async () => {
        const invoice = event.data.object as Stripe.Invoice;
        return handleInvoicePaymentFailed(invoice);
      })
      .with("customer.subscription.trial_will_end", async () => {
        const subscription = event.data.object as Stripe.Subscription;
        return handleTrialWillEnd(subscription);
      })
      .otherwise(() => {
        return Promise.resolve();
      });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  return match(session.mode)
    .with("payment", async () => {
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          planId,
          status: "active",
          stripeCustomerId: session.customer as string,
          updatedAt: new Date(),
        },
        create: {
          userId,
          planId,
          status: "active",
          stripeCustomerId: session.customer as string,
        },
      });
    })
    .otherwise(() => {
      return Promise.resolve();
    });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const planId = subscription.metadata?.planId;

  if (!planId) {
    console.error("Missing planId in subscription metadata:", subscription.id);
    return;
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  return match(existingSubscription)
    .with(null, async () => {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return;

      const userId = customer.metadata?.userId;
      if (!userId) {
        console.error("No userId in customer metadata:", customerId);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.error("User not found in database:", userId);
        return;
      }

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          planId,
          status: subscription.status,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        },
        create: {
          userId,
          planId,
          status: subscription.status,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
        },
      });
    })
    .otherwise(async (existing) => {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId,
          status: subscription.status,
          stripeSubscriptionId: subscription.id,
          updatedAt: new Date(),
        },
      });
    });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      updatedAt: new Date(),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "canceled",
      updatedAt: new Date(),
    },
  });
}

async function getSubscriptionIdFromInvoice(
  invoice: Stripe.Invoice
): Promise<string | null> {
  const subscriptionLineItem = invoice.lines.data.find(
    (line) => line.subscription
  );

  return match(subscriptionLineItem?.subscription)
    .with(P.string, (id) => id)
    .with(P.instanceOf(Object), (sub: Stripe.Subscription) => sub.id)
    .with(null, () => null)
    .with(undefined, () => null)
    .otherwise(() => null);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = await getSubscriptionIdFromInvoice(invoice);

  return match(subscriptionId)
    .with(P.string, async (id) => {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: id },
        data: {
          status: "active",
          updatedAt: new Date(),
        },
      });
    })
    .with(null, () => {
      return Promise.resolve();
    })
    .otherwise(() => Promise.resolve());
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = await getSubscriptionIdFromInvoice(invoice);

  return match(subscriptionId)
    .with(P.string, async (id) => {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: id },
        data: {
          status: "past_due",
          updatedAt: new Date(),
        },
      });
    })
    .with(null, () => {
      return Promise.resolve();
    })
    .otherwise(() => Promise.resolve());
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log("Trial will end for subscription:", subscription.id);
}
