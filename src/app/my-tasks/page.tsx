import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import TaskCard from "@/app/tasks/task-card"
import TransitionLink from "@/components/transition-link"
import { Plus } from "lucide-react"

export default async function MyTasksPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const tasks = await prisma.task.findMany({
    where: {
      clientId: userId,
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: { proposals: true }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
            <p className="mt-1 text-gray-600">Acompanhe e gerencie os pedidos de serviço que você criou.</p>
          </div>
          <TransitionLink 
            href="/tasks/new" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} />
            Criar Novo Pedido
          </TransitionLink>
        </div>

        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">Você ainda não criou nenhum pedido.</h3>
            <p className="mt-2 text-gray-600">Que tal começar agora e encontrar o profissional ideal?</p>
            <div className="mt-6">
              <TransitionLink
                href="/tasks/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Criar seu primeiro pedido
              </TransitionLink>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
