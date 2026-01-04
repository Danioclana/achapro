'use client'

import { useState } from "react"
import { acceptProposal } from "../actions"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Proposal {
  id: string
  price: string
  description: string
  createdAt: Date
  provider: {
    name: string
    avatarUrl: string | null
    rating?: number
  }
}

interface ProposalListProps {
  proposals: Proposal[]
  taskId: string
  isOwner: boolean
}

export default function ProposalList({ proposals, taskId, isOwner }: ProposalListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleAccept(proposalId: string) {
    if (!confirm("Aceitar esta proposta iniciará o chat com o prestador. Confirmar?")) return

    setLoadingId(proposalId)
    try {
      await acceptProposal(proposalId, taskId)
    } catch (error) {
      console.error(error)
      alert("Erro ao aceitar proposta")
      setLoadingId(null)
    }
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed text-gray-500">
        Nenhuma proposta recebida ainda.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <div key={proposal.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {proposal.provider.avatarUrl ? (
                  <Image 
                    src={proposal.provider.avatarUrl} 
                    alt={proposal.provider.name} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 font-bold">
                    {proposal.provider.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{proposal.provider.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                R$ {Number(proposal.price).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-3 bg-gray-50 p-3 rounded text-sm text-gray-700">
            {proposal.description}
          </div>

          {isOwner && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleAccept(proposal.id)}
                disabled={loadingId === proposal.id || loadingId !== null}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loadingId === proposal.id ? 'Processando...' : 'Aceitar Proposta'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
