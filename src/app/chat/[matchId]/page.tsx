import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import ChatWindow from "./chat-window"

interface ChatPageProps {
  params: Promise<{ matchId: string }>
}

export default async function ChatPage(props: ChatPageProps) {
  const params = await props.params;
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    include: {
      task: true,
      client: { select: { id: true, name: true, avatarUrl: true } },
      provider: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!match) notFound()

  // Verify access
  if (match.clientId !== userId && match.providerId !== userId) {
    redirect("/chat") // Or 403
  }

  const isClient = match.clientId === userId
  const otherUser = isClient ? match.provider : match.client

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl min-h-screen sm:min-h-0 sm:h-[calc(100vh-2rem)] sm:my-4 sm:rounded-lg overflow-hidden border border-gray-100">
      <ChatWindow 
        matchId={match.id}
        initialMessages={match.messages}
        currentUserId={userId}
        otherUserName={otherUser.name}
        otherUserAvatar={otherUser.avatarUrl}
        taskTitle={match.task.title}
      />
    </div>
  )
}
