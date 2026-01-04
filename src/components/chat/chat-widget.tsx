'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, X, Minimize2, ExternalLink } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { getMatches } from '@/app/chat/actions'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import DockedChatWindow from './docked-chat-window'

interface MatchPreview {
    id: string
    otherUserName: string
    otherUserAvatar: string | null
    taskTitle: string
    lastMessage: string
}

export default function ChatWidget() {
  const { isSignedIn } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [matches, setMatches] = useState<MatchPreview[]>([])
  const [loading, setLoading] = useState(false)
  
  // State for open docked windows
  const [activeMatches, setActiveMatches] = useState<MatchPreview[]>([])

  const fetchMatches = async () => {
      try {
          const data = await getMatches()
          setMatches(data)
      } catch (error) {
          console.error("Failed to load matches", error)
      }
  }

  useEffect(() => {
    if (isSignedIn) {
        // Fetch initially even if closed to be ready? Or only when open?
        // Let's fetch when open to save resources, but if we want the badge count later we need it.
        // For now, fetch when open.
        if(isOpen) {
            setLoading(true)
            fetchMatches().finally(() => setLoading(false))
        }
    }
  }, [isSignedIn, isOpen])

  useEffect(() => {
      if (!isSignedIn) return

      const channel = supabase
        .channel('global_messages_widget')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
            fetchMatches()
        })
        .subscribe()

      return () => {
          supabase.removeChannel(channel)
      }
  }, [isSignedIn])

  const openChat = (match: MatchPreview) => {
      if (!activeMatches.find(m => m.id === match.id)) {
          // Limit max open windows to avoid overflow (e.g., 3)
          setActiveMatches(prev => {
              const sliced = prev.length >= 3 ? prev.slice(1) : prev
              return [...sliced, match]
          })
      }
      // If mobile, maybe close the list? For now desktop focused as per "docked" request.
  }

  const closeChat = (matchId: string) => {
      setActiveMatches(prev => prev.filter(m => m.id !== matchId))
  }

  if (!isSignedIn) return null

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-4 pointer-events-none">
      
      {/* Docked Windows Area (Left of widget) */}
      <div className="flex items-end gap-4 mr-2">
          {activeMatches.map(match => (
              <DockedChatWindow 
                key={match.id}
                matchId={match.id}
                otherUserName={match.otherUserName}
                otherUserAvatar={match.otherUserAvatar}
                taskTitle={match.taskTitle}
                onClose={() => closeChat(match.id)}
              />
          ))}
      </div>

      {/* Main Widget Button & List */}
      <div className="flex flex-col items-end pointer-events-auto mb-4">
        {isOpen && (
            <div className="mb-4 w-80 bg-white rounded-t-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-4 py-3 flex justify-between items-center text-white rounded-t-lg">
                <h3 className="font-semibold text-sm">Mensagens</h3>
                <div className="flex gap-2">
                <Link href="/chat" className="hover:bg-blue-500 p-1 rounded transition" title="Abrir em tela cheia">
                    <ExternalLink size={16} />
                </Link>
                <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded transition">
                    <Minimize2 size={16} />
                </button>
                </div>
            </div>
            <div className="h-[28rem] overflow-y-auto bg-gray-50">
                {loading && matches.length === 0 && (
                    <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                        Carregando...
                    </div>
                )}

                {!loading && matches.length === 0 && (
                    <div className="text-center text-gray-500 text-sm mt-10 p-4">
                        <p>Nenhuma conversa iniciada.</p>
                        <Link href="/tasks" className="text-blue-600 hover:underline mt-2 block">
                            Encontrar serviços
                        </Link>
                    </div>
                )}
                
                <div className="p-2 space-y-2">
                    {matches.map(match => (
                        <div 
                            key={match.id} 
                            onClick={() => openChat(match)}
                            className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    {match.otherUserAvatar ? (
                                        <Image src={match.otherUserAvatar} alt={match.otherUserName} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500 font-bold">
                                            {match.otherUserName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">{match.otherUserName}</p>
                                    </div>
                                    <p className="text-xs text-blue-600 font-medium truncate mb-1">{match.taskTitle}</p>
                                    <p className="text-xs text-gray-500 truncate">{match.lastMessage}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        )}

        <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
        >
            {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </div>
  )
}
