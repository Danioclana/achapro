import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import TaskForm from "./task-form"

export default async function NewTaskPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Novo Pedido</h1>
          <p className="mt-2 text-gray-600">Descreva o serviço que você precisa e encontre profissionais.</p>
        </div>
        <TaskForm />
      </div>
    </div>
  )
}
