import { describe, it, expect, vi, beforeEach } from 'vitest'
import { acceptProposal, createTask, sendProposal, completeTaskAndReview } from './actions'
import { prisma } from '@/lib/prisma'
import { DeepMockProxy } from 'vitest-mock-extended'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'

const prismaMock = prisma as unknown as DeepMockProxy<any>

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}))

describe('Task Actions', () => {
  // ... (previous createTask tests remain here if not replaced, but assuming I replace the file content or append. 
  // To be safe with 'replace', I will rewrite the whole file to ensure structure or target specific insertion points.
  // Given the complexity, I will overwrite the file to include ALL tests cleanly.)

  describe('createTask', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        ;(auth as any).mockResolvedValue({ userId: 'user_123' })
        ;(currentUser as any).mockResolvedValue({ 
            id: 'user_123', firstName: 'Test', lastName: 'User', emailAddresses: [{ emailAddress: 'test@test.com' }], imageUrl: 'img.jpg'
        })
        prismaMock.profile.findUnique.mockResolvedValue({ id: 'user_123' })
    })

    it('should successfully create a task with valid inputs (Positive)', async () => {
        const formData = new FormData()
        formData.append('title', 'New Task')
        formData.append('description', 'Desc')
        formData.append('category', 'Cleaning')
        formData.append('location', 'NYC')
        formData.append('imageUrls', JSON.stringify(['img1.jpg']))

        await createTask(formData)

        expect(prismaMock.task.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ title: 'New Task', clientId: 'user_123', status: 'OPEN' })
        }))
    })

    it('should throw error if required fields are missing (Negative)', async () => {
        const formData = new FormData()
        formData.append('description', 'Desc')
        await expect(createTask(formData)).rejects.toThrow('Missing required fields')
    })

    it('should throw Unauthorized if user is not logged in (Negative)', async () => {
        ;(auth as any).mockResolvedValue({ userId: null })
        const formData = new FormData()
        await expect(createTask(formData)).rejects.toThrow('Unauthorized')
    })
  })

  describe('sendProposal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        ;(auth as any).mockResolvedValue({ userId: 'provider_999' })
        prismaMock.profile.findUnique.mockResolvedValue({ id: 'provider_999' })
    })

    it('should successfully send a proposal (Positive)', async () => {
        const formData = new FormData()
        formData.append('price', '150.00')
        formData.append('description', 'I can fix it')

        await sendProposal('task_123', formData)

        expect(prismaMock.proposal.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                taskId: 'task_123',
                providerId: 'provider_999',
                price: 150.00,
                description: 'I can fix it'
            })
        }))
    })

    it('should throw error for invalid price input (Negative)', async () => {
        const formData = new FormData()
        formData.append('price', 'invalid_price')
        formData.append('description', 'Desc')

        await expect(sendProposal('task_123', formData)).rejects.toThrow()
    })
  })

  describe('completeTaskAndReview', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        ;(auth as any).mockResolvedValue({ userId: 'client_123' })
    })

    it('should complete task and save review transactionally (Positive)', async () => {
        prismaMock.task.findUnique.mockResolvedValue({ id: 'task_1', clientId: 'client_123' })
        prismaMock.$transaction.mockResolvedValue([{}, {}])

        await completeTaskAndReview('task_1', 'provider_999', 5, 'Great job')

        expect(prismaMock.$transaction).toHaveBeenCalled()
        // Check Task Update
        expect(prismaMock.task.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'task_1' },
            data: { status: 'COMPLETED' }
        }))
        // Check Review Creation
        expect(prismaMock.review.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                taskId: 'task_1',
                reviewerId: 'client_123',
                reviewedId: 'provider_999',
                rating: 5
            })
        }))
    })

    it('should prevent unauthorized completion (Negative)', async () => {
        // User is client_123, but task owner is other_user
        prismaMock.task.findUnique.mockResolvedValue({ id: 'task_1', clientId: 'other_user' })

        await expect(completeTaskAndReview('task_1', 'provider_999', 5, 'Good'))
            .rejects.toThrow('Not authorized')
    })
  })

  describe('acceptProposal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        ;(auth as any).mockResolvedValue({ userId: 'user_123' })
    })

    it('should successfully accept a proposal and create a match', async () => {
        const mockUserId = 'user_123'
        const mockTaskId = 'task_456'
        const mockProposalId = 'prop_789'
        const mockProviderId = 'provider_999'
        const mockMatchId = 'match_000'
    
        prismaMock.task.findUnique.mockResolvedValue({ id: mockTaskId, clientId: mockUserId })
        prismaMock.proposal.findUnique.mockResolvedValue({ id: mockProposalId, providerId: mockProviderId })
        prismaMock.$transaction.mockResolvedValue([{}, {}, {}])
        prismaMock.match.findUnique.mockResolvedValue({ id: mockMatchId, taskId: mockTaskId })
    
        await acceptProposal(mockProposalId, mockTaskId)
    
        expect(prismaMock.$transaction).toHaveBeenCalled()
        expect(redirect).toHaveBeenCalledWith(`/chat/${mockMatchId}`)
    })

    it('should throw error if user is not authorized (not the task owner)', async () => {
        prismaMock.task.findUnique.mockResolvedValue({ id: 'task_456', clientId: 'other_user' })
        await expect(acceptProposal('prop_1', 'task_1')).rejects.toThrow('Not authorized')
    })
  })
})
