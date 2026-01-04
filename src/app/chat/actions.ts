'use server'

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(matchId: string, content: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify membership
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  })

  if (!match || (match.clientId !== userId && match.providerId !== userId)) {
    throw new Error("Not authorized")
  }

  await prisma.message.create({
    data: {
      matchId,
      senderId: userId,
      content,
    }
  })

  // We don't strictly need revalidatePath if we are using Realtime, 
  // but it's good for the initial server render if the user refreshes.
  revalidatePath(`/chat/${matchId}`)
}
