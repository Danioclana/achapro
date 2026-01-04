'use client'

import Link from "next/link"
import { UserButton, useAuth } from "@clerk/nextjs"
import { MessageSquare, Search, User } from "lucide-react"

export default function Navbar() {
  const { userId } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                Acha<span className="text-blue-600">Pro</span>
              </span>
            </Link>
            
            {userId && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  href="/tasks" 
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition"
                >
                  Mural de Tarefas
                </Link>
                <Link 
                  href="/chat" 
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition"
                >
                  Minhas Conversas
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {userId ? (
              <div className="flex items-center gap-4">
                 <Link href="/tasks/new" className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    + Pedir Serviço
                 </Link>
                 
                 <UserButton 
                    appearance={{
                        elements: {
                            avatarBox: "w-10 h-10"
                        }
                    }}
                 >
                    <UserButton.MenuItems>
                        <UserButton.Link
                            label="Meu Perfil"
                            labelIcon={<User size={15} />}
                            href="/profile"
                        />
                    </UserButton.MenuItems>
                 </UserButton>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/sign-in" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
                  Entrar
                </Link>
                <Link href="/sign-up" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Placeholder (Simple version) */}
      {userId && (
          <div className="sm:hidden border-t border-gray-100 flex justify-around p-2 bg-white fixed bottom-0 w-full z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
              <Link href="/tasks" className="flex flex-col items-center p-2 text-gray-600">
                  <Search size={20} />
                  <span className="text-xs mt-1">Buscar</span>
              </Link>
              <Link href="/tasks/new" className="flex flex-col items-center p-2 text-blue-600">
                  <div className="bg-blue-100 p-2 rounded-full -mt-6 border-4 border-white">
                      <span className="text-xl font-bold">+</span>
                  </div>
                  <span className="text-xs mt-1">Pedir</span>
              </Link>
              <Link href="/chat" className="flex flex-col items-center p-2 text-gray-600">
                  <MessageSquare size={20} />
                  <span className="text-xs mt-1">Chat</span>
              </Link>
          </div>
      )}
    </nav>
  )
}
