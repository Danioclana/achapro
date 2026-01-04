'use server'

import { prisma } from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function ensureProfile() {
  const user = await currentUser()
  if (!user) throw new Error("Unauthorized")

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  if (!profile) {
    const email = user.emailAddresses[0]?.emailAddress || ""
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || email
    
    return await prisma.profile.create({
      data: {
        id: user.id,
        name: name,
        avatarUrl: user.imageUrl,
        role: 'CLIENT' // Default fallback
      }
    })
  }
  return profile
}

export async function createTask(formData: FormData) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Ensure profile exists to avoid foreign key constraint error
  await ensureProfile()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const location = formData.get("location") as string
  // imageUrls comes as a JSON string from the client after upload
  const imageUrlsRaw = formData.get("imageUrls") as string 
  const imageUrls = imageUrlsRaw ? JSON.parse(imageUrlsRaw) : []

  if (!title || !description || !category) {
    throw new Error("Missing required fields")
  }

  await prisma.task.create({
    data: {
      clientId: userId,
      title,
      description,
      category,
      location,
      imageUrls,
      status: 'OPEN',
    },
  })

  revalidatePath("/tasks")
  return { success: true }
}

export async function sendProposal(taskId: string, formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await ensureProfile()

  const price = parseFloat(formData.get("price") as string)
  const description = formData.get("description") as string

  if (isNaN(price) || !description) throw new Error("Invalid fields")

  // Verify user role
  // const profile = await prisma.profile.findUnique({ where: { id: userId } })
  // Ideally we should enforce role check, but for MVP flexibility let's allow any auth user or enforce PROVIDER
  // if (profile?.role !== 'PROVIDER') throw new Error("Only providers can send proposals")

  await prisma.proposal.create({
    data: {
      taskId,
      providerId: userId,
      price,
      description
    }
  })

  revalidatePath(`/tasks/${taskId}`)
}

export async function completeTaskAndReview(taskId: string, providerId: string, rating: number, comment: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const task = await prisma.task.findUnique({
    where: { id: taskId }
  })

  if (!task || task.clientId !== userId) {
    throw new Error("Not authorized")
  }

  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { status: 'COMPLETED' }
    }),
    prisma.review.create({
      data: {
        taskId,
        reviewerId: userId,
        reviewedId: providerId,
        rating,
        comment
      }
    })
  ])

  revalidatePath(`/tasks/${taskId}`)
}

export async function acceptProposal(proposalId: string, taskId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify ownership
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (task?.clientId !== userId) throw new Error("Not authorized")

  const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } })
  if (!proposal) throw new Error("Proposal not found")

  // Transaction: Update Proposal -> Update Task -> Create Match
  await prisma.$transaction([
    prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'ACCEPTED' }
    }),
    prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS' }
    }),
    prisma.match.create({
      data: {
        taskId: taskId,
        clientId: userId,
        providerId: proposal.providerId
      }
    })
  ])

  // Fetch the match to get its ID (since create inside transaction returns the object in the array result)
  // However, simpler is to query it or just rely on the fact that taskId is unique in Match
  const match = await prisma.match.findUnique({
    where: { taskId }
  })

  revalidatePath(`/tasks/${taskId}`)
  
  if (match) {
    redirect(`/chat/${match.id}`)
  } else {
    redirect('/chat')
  }
}
