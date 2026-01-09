import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TaskCardProps {
  task: {
    id: string
    title: string
    category: string
    location: string | null
    createdAt: Date
    imageUrls: string[]
    _count?: {
      proposals: number
    }
  }
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <Link href={`/tasks/${task.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 border border-gray-100 overflow-hidden h-full flex flex-col">
        {task.imageUrls && task.imageUrls.length > 0 ? (
          <div className="h-48 bg-gray-200 relative">
            <Image 
              src={task.imageUrls[0]} 
              alt={task.title} 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            Sem foto
          </div>
        )}
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {task.category}
            </span>
            <span className="text-xs text-gray-600">
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{task.title}</h3>
          
          {task.location && (
            <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
              📍 {task.location}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-600">
            <span>
              {task._count?.proposals || 0} propostas
            </span>
            <span className="text-blue-600 font-medium">
              Ver Detalhes →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
