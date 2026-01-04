'use server'

import { prisma } from "@/lib/prisma"
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

export async function getMatches() {
  const { userId } = await auth()
  if (!userId) return []

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { clientId: userId },
        { providerId: userId }
      ]
    },
    include: {
      task: true,
      client: true,
      provider: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return matches.map(match => {
    const isClient = match.clientId === userId
    const otherUser = isClient ? match.provider : match.client
    return {
        id: match.id,
        otherUserName: otherUser.name,
        otherUserAvatar: otherUser.avatarUrl,
        taskTitle: match.task.title,
        lastMessage: match.messages[0]?.content || "Inicie a conversa"
    }
  })
}

export async function getMessages(matchId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify access
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  })

  if (!match || (match.clientId !== userId && match.providerId !== userId)) {
    throw new Error("Unauthorized")
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: 'asc' }
  })

  return messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    createdAt: msg.createdAt
  }))
}
