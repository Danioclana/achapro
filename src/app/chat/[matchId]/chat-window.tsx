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
        // Check if we already have this message (optimistic update or duplicates)
        setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev
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

    // Optimistic update
    /* 
       Optimistic update is tricky because we need the real ID for keys, 
       but let's just wait for server action or realtime.
       Actually, for better UX, we should clear input immediately.
    */
    setNewMessage("")

    try {
      await sendMessage(matchId, content)
      // Realtime listener will catch the echo back or page revalidation
    } catch (error) {
      console.error("Failed to send", error)
      alert("Falha ao enviar mensagem")
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
