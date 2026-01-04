'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const bio = formData.get("bio") as string
  const avatarUrl = formData.get("avatarUrl") as string

  await prisma.profile.update({
    where: { id: userId },
    data: {
      bio,
      ...(avatarUrl && { avatarUrl }),
    },
  })

  revalidatePath("/profile")
}
