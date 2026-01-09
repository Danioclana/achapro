'use client'

import { usePageTransition } from '@/context/page-transition-context'
import LoadingSpinner from './loading-spinner'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function GlobalLoadingIndicator() {
    const { isLoading, setIsLoading } = usePageTransition()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        setIsLoading(false)
    }, [pathname, searchParams, setIsLoading])

    return isLoading ? <LoadingSpinner /> : null
}