'use client'

import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { supabase } from "@/lib/supabase"
import { createTask } from "../actions"
import imageCompression from 'browser-image-compression'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { CATEGORIES } from "@/lib/categories"
import LoadingSpinner from "@/components/loading-spinner"

function SubmitButton({ uploading }: { uploading: boolean }) {
  const { pending } = useFormStatus()

  return (
    <>
      {pending && <LoadingSpinner />}
      <button
        type="submit"
        disabled={pending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {pending ? (uploading ? 'Enviando fotos...' : 'Criando tarefa...') : 'Publicar Pedido'}
      </button>
    </>
  )
}

export default function TaskForm() {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [cep, setCep] = useState("")
  const [address, setAddress] = useState({
    bairro: "",
    cidade: "",
    uf: "",
  })
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState("")

  // Cleanup previews to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawCepValue = e.target.value.replace(/\D/g, '')
    
    let maskedCepValue = rawCepValue;
    if (rawCepValue.length > 5) {
      maskedCepValue = rawCepValue.substring(0, 5) + '-' + rawCepValue.substring(5, 8);
    }

    setCep(maskedCepValue)
    setAddress({ bairro: "", cidade: "", uf: "" })
    setCepError("")

    if (rawCepValue.length === 8) {
      setCepLoading(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawCepValue}/json/`)
        if (!response.ok) throw new Error("Falha na rede")
        const data = await response.json()
        if (data.erro) {
          setCepError("CEP não encontrado.")
          toast.error("CEP não encontrado.")
        } else {
          setAddress({
            bairro: data.bairro,
            cidade: data.localidade,
            uf: data.uf,
          })
        }
      } catch (error) {
        setCepError("Erro ao buscar CEP.")
        toast.error("Erro ao buscar CEP. Tente novamente.")
      } finally {
        setCepLoading(false)
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      if (images.length + filesArray.length > 5) {
        toast.error("Você pode enviar no máximo 5 imagens.")
        return
      }
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
    if (!address.bairro || !address.cidade || !address.uf) {
      toast.error("Por favor, preencha um CEP válido para definir a localização.")
      // Optionally focus the CEP input
      document.getElementById("cep")?.focus()
      return
    }

    if (images.length > 0) {
      setUploading(true)
    }
    
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
      if (images.length > 0) {
        setUploading(false)
      }
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
          <div className="relative">
            <input
              type="text"
              name="cep"
              id="cep"
              value={cep}
              onChange={handleCepChange}
              maxLength={9}
              required
              placeholder="Ex: 12345-678"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {cepLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {cepError && <p className="mt-1 text-sm text-red-600">{cepError}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro</label>
          <input
            type="text"
            id="bairro"
            value={address.bairro}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
          <input
            type="text"
            id="cidade"
            value={address.cidade}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="uf" className="block text-sm font-medium text-gray-700">Estado (UF)</label>
          <input
            type="text"
            id="uf"
            value={address.uf}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
          />
        </div>
        {/* Hidden input to hold the standardized location string, which will be read by formData */}
        <input type="hidden" name="location" value={address.bairro ? `${address.bairro}, ${address.cidade} - ${address.uf}` : ""} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fotos (Opcional)</label>
        <div className="flex items-center justify-center w-full">
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg ${images.length >= 5 ? 'bg-gray-200 cursor-not-allowed' : 'cursor-pointer bg-gray-50 hover:bg-gray-100'} transition`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm text-gray-600">
                {images.length >= 5 
                  ? 'Limite de 5 fotos atingido' 
                  : <span className="font-semibold">Clique para enviar</span>
                }
              </p>
              <p className="text-xs text-gray-600">PNG, JPG or WEBP (MAX. 5 Fotos)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept="image/*"
              onChange={handleImageChange}
              disabled={images.length >= 5}
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

      <SubmitButton uploading={uploading} />
    </form>
  )
}
