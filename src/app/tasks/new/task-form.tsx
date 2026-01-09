'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { createTask } from "../actions"
import imageCompression from 'browser-image-compression'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const CATEGORIES = [
  "Manutenção Doméstica",
  "Limpeza",
  "Tecnologia",
  "Aulas",
  "Beleza e Estética",
  "Transporte",
  "Outros"
]

export default function TaskForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // Cleanup previews to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImages(prev => [...prev, ...filesArray])
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      const newPreviews = [...prev]
      URL.revokeObjectURL(newPreviews[index])
      return newPreviews.filter((_, i) => i !== index)
    })
  }

  const compressAndUploadImages = async () => {
    const urls: string[] = []
    
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }

    for (const file of images) {
      try {
        const compressedFile = await imageCompression(file, options)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('tasks')
          .upload(filePath, compressedFile)

        if (uploadError) {
             if (uploadError.message.includes("Bucket not found")) {
                 throw new Error("Bucket 'tasks' não configurado no Supabase.")
             }
             if (uploadError.message.includes("row-level security")) {
                 throw new Error("Permissão negada. Configure as Políticas (RLS) do Bucket 'tasks' no Supabase para permitir uploads públicos.")
             }
             throw uploadError
        }

        const { data } = supabase.storage.from('tasks').getPublicUrl(filePath)
        urls.push(data.publicUrl)
      } catch (error: any) {
        console.error('Error uploading image:', error)
        const msg = error.message || "Erro desconhecido"
        toast.error(`Erro ao enviar imagem: ${msg}`)
        throw new Error("UPLOAD_FAILED") // Throw a specific error to identify it later
      }
    }
    return urls
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setUploading(true)
    
    try {
      // 1. Upload Images
      let urls: string[] = []
      if (images.length > 0) {
          urls = await compressAndUploadImages()
      }
      
      // 2. Append URLs to formData
      formData.set('imageUrls', JSON.stringify(urls))
      
      // 3. Call Server Action
      await createTask(formData)
      
      toast.success("Tarefa criada com sucesso!")
      router.push("/tasks")
      
    } catch (error: any) {
      console.error("Error creating task:", error)
      // If the error was already handled (like upload failure), don't show generic toast
      if (error.message !== "UPLOAD_FAILED") {
         toast.error(error.message || "Falha ao criar tarefa. Tente novamente.")
      }
    } finally {
        setLoading(false)
        setUploading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Pedido</label>
        <input
          type="text"
          name="title"
          id="title"
          required
          placeholder="Ex: Conserto de Vazamento na Pia"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
        <select
          name="category"
          id="category"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecione uma categoria</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição Detalhada</label>
        <textarea
          name="description"
          id="description"
          rows={4}
          required
          placeholder="Descreva o problema ou serviço necessário com detalhes..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Localização (Bairro/Cidade)</label>
        <input
          type="text"
          name="location"
          id="location"
          placeholder="Ex: Centro, São Paulo"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fotos (Opcional)</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm text-gray-600"><span className="font-semibold">Clique para enviar</span></p>
              <p className="text-xs text-gray-600">PNG, JPG or WEBP (MAX. 5 Fotos)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
        
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {previews.map((url, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <Image 
                  src={url} 
                  alt={`Preview ${index}`} 
                  fill 
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  title="Remover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? (uploading ? 'Enviando fotos...' : 'Criando tarefa...') : 'Publicar Pedido'}
      </button>
    </form>
  )
}
