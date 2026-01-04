import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep(),
}))

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} fill={props.fill?.toString()} />
  },
}))

// Mock IntersectionObserver
class IntersectionObserverMock {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  disconnect = vi.fn()
  observe = vi.fn()
  takeRecords = vi.fn()
  unobserve = vi.fn()
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
