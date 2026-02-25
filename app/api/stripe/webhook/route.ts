// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

function mapSubscriptionStatus(sub: Stripe.Subscription) {
  // Stripe statuses: active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired, paused
  if (sub.status === "active" || sub.status === "trialing") return "ACTIVE";
  if (sub.status === "past_due" || sub.status === "unpaid") return "PAST_DUE";
  if (sub.status === "canceled") return "CANCELED";
  return "INACTIVE";
}

async function updateOrgFromSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const status = mapSubscriptionStatus(sub);

  // Algunos tipos de Stripe cambian según versión. Leemos seguro.
  const currentPeriodEndUnix = (sub as any).current_period_end as number | undefined;
  const currentPeriodEnd = currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : null;

  const cancelAtPeriodEnd = !!(sub as any).cancel_at_period_end;

  await prisma.organization.updateMany({
    where: { stripeCustomerId: customerId, deletedAt: null },
    data: {
      subscriptionStatus: status,
      stripeSubscriptionId: sub.id,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      updatedAt: new Date(),
    },
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whsec) {
    return NextResponse.json(
      { error: "Missing stripe-signature or STRIPE_WEBHOOK_SECRET" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whsec);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (customerId) {
          await prisma.organization.updateMany({
            where: { stripeCustomerId: customerId, deletedAt: null },
            data: {
              stripeSubscriptionId: subscriptionId ?? undefined,
              // No marcamos ACTIVE aquí “a ciegas”. Lo fiable viene de subscription.updated.
              updatedAt: new Date(),
            },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await updateOrgFromSubscription(sub);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

        if (customerId) {
          await prisma.organization.updateMany({
            where: { stripeCustomerId: customerId, deletedAt: null },
            data: { subscriptionStatus: "PAST_DUE", updatedAt: new Date() },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}