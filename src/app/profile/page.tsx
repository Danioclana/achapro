import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"

export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Ensure user exists in our DB (in case webhook failed or latency)
  // Or just fetch it. If null, maybe show a loading state or "Profile creating..."
  const profile = await prisma.profile.findUnique({
    where: { id: userId }
  })

  // Fallback if profile not found yet (race condition with webhook)
  if (!profile) {
     return <div className="p-8 text-center">Profile is being created... please refresh in a moment.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Edit Profile</h1>
        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}
