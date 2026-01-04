'use client'

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { sendMessage } from "../actions"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
}

interface ChatWindowProps {
  matchId: string
  initialMessages: Message[]
  currentUserId: string
  otherUserName: string
  otherUserAvatar: string | null
  taskTitle: string
}

export default function ChatWindow({ 
  matchId, 
  initialMessages, 
  currentUserId,
  otherUserName,
  otherUserAvatar,
  taskTitle
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
            // Check if we already have this message by ID
            if (prev.some(m => m.id === newMsg.id)) return prev
            
            // Deduplication strategy for optimistic updates:
            // If we have a message with same content from same sender created in last 2 seconds, assume it's the optimistic one confirmed.
            // (This is a heuristic for MVP)
            const isOptimisticDuplicate = prev.some(m => 
                m.senderId === newMsg.senderId && 
                m.content === newMsg.content &&
                Math.abs(new Date(m.createdAt).getTime() - new Date(newMsg.createdAt).getTime()) < 5000 // 5 sec window
            )

            if (isOptimisticDuplicate) {
                // Ideally we replace the temp ID with real ID here, but React state update is tricky.
                // We'll just return prev to avoid double rendering the same text.
                // A better approach would be to swap the item.
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
    if (!newMessage.trim() || sending) return

    setSending(true)
    const content = newMessage
    const tempId = crypto.randomUUID()
    
    // Optimistic update: Add message immediately to UI
    const optimisticMsg: Message = {
        id: tempId,
        content: content,
        senderId: currentUserId,
        createdAt: new Date()
    }

    setMessages(prev => [...prev, optimisticMsg])
    setNewMessage("")

    try {
      await sendMessage(matchId, content)
      // We rely on the server action revalidation or subsequent fetch to confirm.
      // Ideally, the realtime event will come in and might duplicate if we don't handle IDs carefully.
      // But since we use a temp ID, the real message from DB will have a different ID.
      // We should replace the temp message with the real one if we could, but for this MVP:
      // The Realtime listener will receive the 'INSERT' with the REAL ID.
      // We need to filter out the optimistic message once the real one arrives? 
      // Or just let the list refresh. 
      
      // Actually, simplest 'fix' for MVP without complex state management:
      // Don't add optimistic message if we trust Realtime is fast. 
      // BUT user said "parece que não está indo". So optimistic is good.
      
      // Let's refine the Realtime listener to deduplicate better or ignore the optimistic one if possible.
      // For now, let's keep the optimistic one and when the realtime event comes (or page refresh), it corrects.
    } catch (error) {
      console.error("Failed to send", error)
      alert("Falha ao enviar mensagem")
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100">
      
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {otherUserAvatar ? (
              <Image src={otherUserAvatar} alt={otherUserName} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 font-bold">
                {otherUserName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
            <p className="text-xs text-gray-500">{taskTitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-4 py-2 shadow-sm ${
                isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'} text-right`}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white p-4 border-t flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border"
            disabled={sending}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 pl-0.5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  )
}
