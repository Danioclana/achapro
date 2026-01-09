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

export async function markMessagesAsRead(matchId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await prisma.message.updateMany({
    where: {
      matchId: matchId,
      senderId: {
        not: userId, // Only mark messages sent by the other person as read
      },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  })

  // Revalidate the path that shows unread counts, if necessary
  // For now, we will rely on client-side state updates after this call
}

export async function getUnreadMessageCount() {
    const { userId } = await auth()
    if (!userId) return 0
    
    const count = await prisma.message.count({
        where: {
            match: {
                OR: [
                    { clientId: userId },
                    { providerId: userId }
                ]
            },
            senderId: {
                not: userId
            },
            isRead: false
        }
    })

    return count
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
      task: {
        select: { title: true }
      },
      client: {
        select: { id: true, name: true, avatarUrl: true }
      },
      provider: {
        select: { id: true, name: true, avatarUrl: true }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      _count: {
        select: {
          messages: {
            where: {
              isRead: false,
              senderId: { not: userId }
            }
          }
        }
      }
    },
    orderBy: {
      messages: {
        _count: 'desc' // Prioritize matches with recent messages, although createdAt on match is better
      }
    }
  })

  return matches.map(match => {
    const isClient = match.clientId === userId
    const otherUser = isClient ? match.provider : match.client
    return {
        id: match.id,
        otherUserName: otherUser.name,
        otherUserAvatar: otherUser.avatarUrl,
        taskTitle: match.task.title,
        lastMessage: match.messages[0]?.content || "Inicie a conversa",
        unreadCount: match._count.messages
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
    createdAt: msg.createdAt,
    isRead: msg.isRead
  }))
}
