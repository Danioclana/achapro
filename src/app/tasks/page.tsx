import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { CATEGORIES } from "@/lib/categories"
import TransitionLink from "@/components/transition-link"
import TaskCard from "./task-card"

interface TasksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TasksPage(props: TasksPageProps) {
  const { userId } = await auth()
  const searchParams = await props.searchParams;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined

  const tasks = await prisma.task.findMany({
    where: {
      status: 'OPEN',
      ...(category && category !== 'Todos' ? { category } : {}),
      ...(userId && { NOT: { clientId: userId } })
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

  const categories = ["Todos", ...CATEGORIES]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mural de Tarefas</h1>
            <p className="mt-1 text-gray-600">Encontre serviços próximos a você para realizar.</p>
          </div>
          <TransitionLink 
            href="/tasks/new" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            + Criar Pedido
          </TransitionLink>
        </div>

        {/* Filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <TransitionLink
                key={cat}
                href={cat === 'Todos' ? '/tasks' : `/tasks?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  (cat === 'Todos' && !category) || category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </TransitionLink>
            ))}
          </div>
        </div>

        {/* Grid */}
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">Nenhuma tarefa encontrada</h3>
            <p className="mt-1 text-gray-600">Seja o primeiro a postar uma tarefa nesta categoria!</p>
          </div>
        )}
      </div>
    </div>
  )
}
