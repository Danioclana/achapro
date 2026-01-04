import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function ChatListPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  // Find matches where user is client OR provider
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { clientId: userId },
        { providerId: userId }
      ]
    },
    include: {
      task: true,
      client: { select: { id: true, name: true, avatarUrl: true } },
      provider: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Minhas Conversas</h1>
        
        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Você ainda não tem conversas ativas.
            <br />
            <Link href="/tasks" className="text-blue-600 hover:underline mt-2 inline-block">
              Buscar tarefas
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => {
              const isClient = match.clientId === userId
              const otherUser = isClient ? match.provider : match.client
              const lastMessage = match.messages[0]

              return (
                <Link key={match.id} href={`/chat/${match.id}`} className="block">
                  <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {otherUser.avatarUrl ? (
                        <Image src={otherUser.avatarUrl} alt={otherUser.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 font-bold">
                          {otherUser.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {otherUser.name}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true, locale: ptBR })}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate font-medium mb-1">
                        {match.task.title}
                      </p>
                      
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage ? lastMessage.content : <span className="italic">Inicie a conversa...</span>}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
