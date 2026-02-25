// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const u = await getSessionUser();
  if (!u) return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL), 303);

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://limar-eta.vercel.app";
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });

  const dbUser = await prisma.user.findUnique({
    where: { id: u.id },
    select: { isEnabled: true, organizationId: true },
  });

  if (!dbUser?.organizationId) {
    return NextResponse.redirect(new URL("/login", baseUrl), 303);
  }

  // Bloqueo manual: no permitimos checkout si el usuario está deshabilitado
  if (!dbUser.isEnabled) {
    return NextResponse.redirect(new URL("/cuenta-bloqueada", baseUrl), 303);
  }

  const org = await prisma.organization.findUnique({
    where: { id: dbUser.organizationId },
    select: {
      id: true,
      name: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      deletedAt: true,
    },
  });

  if (!org || org.deletedAt) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Si ya está activo, no lo mandes a pagar otra vez
  if (org.subscriptionStatus === "ACTIVE") {
    return NextResponse.redirect(new URL("/dashboard", baseUrl), 303);
  }

  // Customer en Stripe (1 por Organization)
  let customerId = org.stripeCustomerId ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: org.name,
      metadata: { organizationId: org.id },
    });

    customerId = customer.id;

    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/activar/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/activar/cancelado`,
    allow_promotion_codes: false,
    metadata: {
      organizationId: org.id,
      userId: u.id,
    },
    subscription_data: {
      metadata: {
        organizationId: org.id,
      },
    },
  });

  // IMPORTANTE: para <form method="post">, redirige a Stripe
  return NextResponse.redirect(session.url!, 303);
}