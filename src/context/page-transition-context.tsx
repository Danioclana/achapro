'use client'

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'

interface PageTransitionContextType {
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined)

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <PageTransitionContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </PageTransitionContext.Provider>
  )
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext)
  if (context === undefined) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider')
  }
  return context
}
