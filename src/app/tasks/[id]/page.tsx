import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import TransitionLink from "@/components/transition-link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { auth } from "@clerk/nextjs/server"
import ProposalForm from "./proposal-form"
import ProposalList from "./proposal-list"
import CompleteTaskModal from "./complete-task-modal"
import { Star } from "lucide-react"

interface TaskDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function TaskDetailsPage(props: TaskDetailsPageProps) {
  const params = await props.params;
  const { userId } = await auth()

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      },
      match: true,
      reviews: {
        include: {
          reviewer: { select: { name: true, avatarUrl: true } }
        }
      },
      proposals: {
        include: {
          provider: {
            select: {
              name: true,
              avatarUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!task) {
    notFound()
  }

  const isOwner = userId === task.client.id
  const hasProposed = task.proposals.some(p => p.providerId === userId)
  const isTaskOpen = task.status === 'OPEN'
  const isTaskInProgress = task.status === 'IN_PROGRESS'
  const isTaskCompleted = task.status === 'COMPLETED'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Meta */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {task.category}
            </span>
            <span className="text-gray-500 text-sm">
              Publicado {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: ptBR })}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>

          <div className="flex items-center gap-4 border-t pt-4 mt-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {task.client.avatarUrl ? (
                <Image 
                  src={task.client.avatarUrl} 
                  alt={task.client.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 font-bold text-lg">
                  {task.client.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{task.client.name}</p>
              <p className="text-sm text-gray-500">Cliente</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Descrição</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Images */}
            {task.imageUrls && task.imageUrls.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Fotos</h2>
                <div className="grid grid-cols-2 gap-4">
                  {task.imageUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image 
                        src={url} 
                        alt={`Evidence ${idx + 1}`} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Review Section if Completed */}
            {isTaskCompleted && task.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                   Avaliação do Serviço <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
                </h2>
                {task.reviews.map(review => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center gap-2 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-gray-700 italic">&quot;{review.comment}&quot;</p>
                    <p className="text-sm text-gray-500">Avaliado por {review.reviewer.name}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Proposals List */}
            {isOwner && isTaskOpen && (
               <div className="bg-white rounded-lg shadow-sm p-6">
                 <h2 className="text-xl font-semibold mb-4">Propostas Recebidas ({task.proposals.length})</h2>
                 <ProposalList 
                    proposals={task.proposals.map(p => ({
                      ...p,
                      price: p.price.toString(),
                      createdAt: new Date(p.createdAt)
                    }))} 
                    taskId={task.id} 
                    isOwner={isOwner} 
                  />
               </div>
            )}

          </div>

          <div className="space-y-6">
            {/* Location & Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Detalhes</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Localização</label>
                  <p className="font-medium text-gray-900">{task.location || "Não informado"}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isTaskOpen ? 'bg-green-100 text-green-800' :
                      isTaskInProgress ? 'bg-yellow-100 text-yellow-800' :
                      isTaskCompleted ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {isTaskOpen ? 'Aberto para Propostas' : 
                       isTaskInProgress ? 'Em Andamento' : 
                       isTaskCompleted ? 'Concluído' : task.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-6 pt-6 border-t">
                {isOwner ? (
                  isTaskInProgress && task.match ? (
                    <CompleteTaskModal 
                      taskId={task.id} 
                      providerId={task.match.providerId} 
                    />
                  ) : isTaskCompleted ? (
                    <div className="text-center text-green-600 font-medium">
                       Serviço Concluído ✅
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      Aguardando propostas interessantes.
                    </p>
                  )
                ) : !userId ? (
                   <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Faça login para enviar uma proposta.</p>
                   </div>
                ) : isTaskOpen ? (
                  hasProposed ? (
                    <div className="bg-green-50 text-green-700 p-3 rounded text-center text-sm font-medium">
                      Proposta enviada!
                    </div>
                  ) : (
                    <ProposalForm taskId={task.id} />
                  )
                ) : isTaskInProgress && task.match?.providerId === userId ? (
                   <div className="text-center">
                      <p className="text-sm text-blue-600 font-medium mb-3">Você está realizando este serviço!</p>
                      <TransitionLink href={`/chat/${task.match.id}`} className="inline-flex items-center text-sm text-blue-600 hover:underline">
                         Ir para o chat →
                      </TransitionLink>
                   </div>
                ) : (
                   <p className="text-sm text-gray-500 text-center">
                     Esta tarefa não está mais aceitando propostas.
                   </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

