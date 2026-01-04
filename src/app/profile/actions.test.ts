import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateProfile } from './actions'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { DeepMockProxy } from 'vitest-mock-extended'

const prismaMock = prisma as unknown as DeepMockProxy<any>

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

describe('updateProfile Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully update profile when authenticated (Positive)', async () => {
    // Arrange
    const mockUserId = 'user_123'
    ;(auth as any).mockResolvedValue({ userId: mockUserId })
    
    const formData = new FormData()
    formData.append('bio', 'New Bio')
    formData.append('avatarUrl', 'http://new.img')

    prismaMock.profile.update.mockResolvedValue({ id: mockUserId } as any)

    // Act
    await updateProfile(formData)

    // Assert
    expect(prismaMock.profile.update).toHaveBeenCalledWith({
      where: { id: mockUserId },
      data: {
        bio: 'New Bio',
        avatarUrl: 'http://new.img',
      },
    })
  })

  it('should throw Unauthorized error when user is not logged in (Negative)', async () => {
    // Arrange
    ;(auth as any).mockResolvedValue({ userId: null })
    const formData = new FormData()

    // Act & Assert
    await expect(updateProfile(formData)).rejects.toThrow('Unauthorized')
    expect(prismaMock.profile.update).not.toHaveBeenCalled()
  })

  it('should only update bio if avatarUrl is missing (Positive - Partial Update)', async () => {
    // Arrange
    const mockUserId = 'user_123'
    ;(auth as any).mockResolvedValue({ userId: mockUserId })
    
    const formData = new FormData()
    formData.append('bio', 'Just Bio')
    // avatarUrl missing

    // Act
    await updateProfile(formData)

    // Assert
    expect(prismaMock.profile.update).toHaveBeenCalledWith({
      where: { id: mockUserId },
      data: {
        bio: 'Just Bio',
      },
    })
  })
})
