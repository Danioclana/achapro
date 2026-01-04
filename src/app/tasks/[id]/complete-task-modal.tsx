'use client'

import { useState } from "react"
import { completeTaskAndReview } from "../actions"
import { Star } from "lucide-react"

interface CompleteTaskModalProps {
  taskId: string
  providerId: string
}

export default function CompleteTaskModal({ taskId, providerId }: CompleteTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await completeTaskAndReview(taskId, providerId, rating, comment)
      setIsOpen(false)
    } catch (error) {
      console.error(error)
      alert("Erro ao concluir tarefa")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-medium shadow-sm"
      >
        Concluir e Avaliar Serviço
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Concluir Serviço</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Como foi sua experiência com este profissional? Sua avaliação ajuda a comunidade.
        </p>

        <div className="space-y-6">
          {/* Stars */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-gray-700 mb-2">Sua Nota</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm font-semibold text-yellow-600">
                {rating === 5 ? "Excelente!" : rating === 4 ? "Muito Bom" : rating === 3 ? "Bom" : rating === 2 ? "Regular" : "Ruim"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Comentário (Opcional)</label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
              placeholder="Escreva algo sobre o serviço..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Confirmar Conclusão"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
