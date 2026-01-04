import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, first_name, last_name, image_url, email_addresses, public_metadata } = evt.data;
    
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : "";
    const name = `${first_name || ''} ${last_name || ''}`.trim() || email;

    // Determine role from public_metadata if available, otherwise default to CLIENT
    // Assuming metadata structure { role: "CLIENT" | "PROVIDER" }
    interface UserMetadata {
      role?: string;
    }
    const role = (public_metadata as UserMetadata)?.role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';

    try {
        await prisma.profile.upsert({
            where: { id: id },
            update: {
                name: name,
                avatarUrl: image_url,
                // We might not want to overwrite role on update if it's not provided
                // But for now let's assume metadata is the source of truth
                // role: role, 
                // email: email // Profile model doesn't have email based on schema I read, checking again...
            },
            create: {
                id: id,
                name: name,
                avatarUrl: image_url,
                role: role
            }
        });
        console.log(`User ${id} upserted in database`);
    } catch (error) {
        console.error('Error upserting user in database:', error);
        return new Response('Error saving user to database', { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Webhook received', success: true })
}
