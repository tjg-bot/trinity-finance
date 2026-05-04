/**
 * Clerk webhook - sync user creation/update to our DB.
 */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@trinity/db";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env["CLERK_WEBHOOK_SECRET"];
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: { type: string; data: { id: string; email_addresses?: Array<{ email_address: string }>; phone_numbers?: Array<{ phone_number: string }>; first_name?: string; last_name?: string } };

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof evt;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // Store for replay/debug
  await prisma.webhookEvent.create({
    data: {
      source: "clerk",
      eventType: evt.type,
      payload: JSON.parse(payload) as Record<string, unknown>,
    },
  });

  const { type, data } = evt;

  if (type === "user.created" || type === "user.updated") {
    const email = data.email_addresses?.[0]?.email_address;
    const phone = data.phone_numbers?.[0]?.phone_number;

    if (!email) return new Response("No email", { status: 400 });

    await prisma.user.upsert({
      where: { clerkId: data.id },
      create: {
        clerkId: data.id,
        email,
        phone,
        firstName: data.first_name,
        lastName: data.last_name,
        role: "APPLICANT",
      },
      update: {
        email,
        phone,
        firstName: data.first_name,
        lastName: data.last_name,
      },
    });
  }

  return new Response("OK", { status: 200 });
}
