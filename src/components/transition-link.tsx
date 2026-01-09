'use client'

import Link, { LinkProps } from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { usePageTransition } from '@/context/page-transition-context'
import { ReactNode, useEffect } from 'react'

type TransitionLinkProps = LinkProps & {
  children: ReactNode
  className?: string
}

export default function TransitionLink({ children, ...props }: TransitionLinkProps) {
  const { setIsLoading, isLoading } = usePageTransition()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Turn off loading state on route change
    if (isLoading) {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetUrl = new URL(props.href.toString(), window.location.origin)
    const currentUrl = new URL(window.location.href)

    // Prevent re-triggering loading state for same-page navigation
    if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
      return
    }
    
    setIsLoading(true)
  }

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  )
}
