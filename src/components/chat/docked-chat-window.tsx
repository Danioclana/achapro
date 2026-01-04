'use client'

import { useState, useEffect, useRef } from "react"
import { X, Send, Minimize2 } from "lucide-react"
import Image from "next/image"
import { getMessages, sendMessage } from "@/app/chat/actions"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@clerk/nextjs"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
}

interface DockedChatWindowProps {
  matchId: string
  otherUserName: string
  otherUserAvatar: string | null
  taskTitle: string
  onClose: () => void
}

export default function DockedChatWindow({
  matchId,
  otherUserName,
  otherUserAvatar,
  taskTitle,
  onClose
}: DockedChatWindowProps) {
  const { userId } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!isMinimized) {
        scrollToBottom()
    }
  }, [messages, isMinimized])

  useEffect(() => {
    let isMounted = true
    getMessages(matchId)
      .then(msgs => {
        if (isMounted) {
            setMessages(msgs)
            setLoading(false)
        }
      })
      .catch(err => {
          console.error("Failed to load messages", err)
          if(isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [matchId])

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `matchId=eq.${matchId}`
      }, (payload) => {
        const newMsg = payload.new as { id: string; content: string; senderId: string; createdAt: string }
        
        setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            
            // Deduplication (Optimistic)
            const isOptimisticDuplicate = prev.some(m => 
                m.senderId === newMsg.senderId && 
                m.content === newMsg.content &&
                Math.abs(new Date(m.createdAt).getTime() - new Date(newMsg.createdAt).getTime()) < 5000
            )

            if (isOptimisticDuplicate) {
                return prev.map(m => 
                    (m.senderId === newMsg.senderId && m.content === newMsg.content) 
                    ? { ...m, id: newMsg.id, createdAt: new Date(newMsg.createdAt) } 
                    : m
                )
            }

            return [...prev, {
                id: newMsg.id,
                content: newMsg.content,
                senderId: newMsg.senderId,
                createdAt: new Date(newMsg.createdAt)
            }]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending || !userId) return

    setSending(true)
    const content = newMessage
    setNewMessage("")

    // Optimistic Update
    const tempId = crypto.randomUUID()
    const optimisticMsg: Message = {
        id: tempId,
        content: content,
        senderId: userId,
        createdAt: new Date()
    }

    setMessages(prev => [...prev, optimisticMsg])

    try {
      await sendMessage(matchId, content)
    } catch (error) {
      console.error("Failed to send", error)
      setMessages(prev => prev.filter(m => m.id !== tempId))
      alert("Erro ao enviar mensagem")
    } finally {
      setSending(false)
    }
  }

  if (isMinimized) {
      return (
          <div className="w-64 bg-white rounded-t-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto">
             <div 
                className="bg-white px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setIsMinimized(false)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="relative w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {otherUserAvatar && <Image src={otherUserAvatar} alt={otherUserName} fill className="object-cover" />}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 truncate">{otherUserName}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                </button>
             </div>
          </div>
      )
  }

  return (
    <div className="w-80 h-96 bg-white rounded-t-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="bg-blue-600 px-3 py-2 flex justify-between items-center text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden">
             <div className="relative w-8 h-8 rounded-full bg-white/20 overflow-hidden flex-shrink-0 border border-white/30">
                {otherUserAvatar ? (
                    <Image src={otherUserAvatar} alt={otherUserName} fill className="object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-white font-bold text-xs">
                        {otherUserName.charAt(0)}
                    </div>
                )}
             </div>
             <div className="min-w-0">
                 <h3 className="font-semibold text-sm truncate leading-tight">{otherUserName}</h3>
                 <p className="text-[10px] text-blue-100 truncate">{taskTitle}</p>
             </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsMinimized(true)} className="hover:bg-white/20 p-1 rounded transition">
            <Minimize2 size={16} />
          </button>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3">
        {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">Carregando...</div>
        ) : (
            <>
                {messages.map((msg) => {
                    const isMe = msg.senderId === userId
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm shadow-sm ${
                                isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                            }`}>
                                <p className="break-words leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </>
        )}
      </div>

      {/* Input */}
      <div className="p-2 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 text-sm bg-gray-100 border-0 rounded-full px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition shrink-0"
            >
                <Send size={16} />
            </button>
        </form>
      </div>
    </div>
  )
}
