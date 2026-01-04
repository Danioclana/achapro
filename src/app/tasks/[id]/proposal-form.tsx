'use client'

import { useState } from "react"
import { sendProposal } from "../actions"

interface ProposalFormProps {
  taskId: string
}

export default function ProposalForm({ taskId }: ProposalFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await sendProposal(taskId, formData)
      // Form resets automatically or we show success message?
      // Server action revalidates, so list should appear if we are showing it.
      // But for Provider, maybe just "Proposal Sent".
    } catch (error) {
      console.error(error)
      alert("Erro ao enviar proposta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Enviar Orçamento</h3>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">R$</span>
            </div>
            <input
              type="number"
              name="price"
              id="price"
              step="0.01"
              required
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mensagem</label>
          <textarea
            name="description"
            id="description"
            rows={3}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
            placeholder="Descreva o que está incluso no valor..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Proposta'}
        </button>
      </form>
    </div>
  )
}
