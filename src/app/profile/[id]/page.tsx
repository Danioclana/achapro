import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, MapPin, CheckCircle, Calendar, MessageCircle, Briefcase } from "lucide-react";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

async function getProfile(id: string) {
  return await prisma.profile.findUnique({
    where: { id },
    include: {
      reviewsReceived: {
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: true
        }
      },
      matchesAsProvider: {
        where: {
          task: {
            status: 'COMPLETED'
          }
        },
        include: {
          task: true
        }
      }
    }
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const user = await currentUser();
  const profile = await getProfile(id);

  if (!profile) {
    return notFound();
  }

  const isOwnProfile = user?.id === profile.id;
  
  // Calculate average rating
  const totalReviews = profile.reviewsReceived.length;
  const averageRating = totalReviews > 0
    ? profile.reviewsReceived.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 0;

  // Portfolio items (tasks completed with images)
  const portfolioItems = profile.matchesAsProvider
    .map(match => match.task)
    .filter(task => task.imageUrls && task.imageUrls.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                {profile.avatarUrl ? (
                  <Image 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    width={128} 
                    height={128} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <span className="text-4xl font-bold">{profile.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              {profile.role === 'PROVIDER' && (
                <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="Prestador Verificado">
                  <CheckCircle size={16} />
                </div>
              )}
            </div>
            
            {!isOwnProfile && (
               <div className="flex gap-3 mb-2">
                 {/* Placeholder for "Invite" logic - linking to new task for now */}
                 <Link 
                    href="/tasks/new" 
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                 >
                   <Briefcase size={18} />
                   Contratar
                 </Link>
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {profile.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  <span className="font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                  <span>({totalReviews} avaliações)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Membro desde {new Date(profile.createdAt).getFullYear()}
                </span>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Sobre</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {profile.bio || "Este profissional ainda não escreveu uma biografia."}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-fit">
              <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Tarefas Concluídas</span>
                  <span className="font-semibold text-gray-900">{profile.matchesAsProvider.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Taxa de Resposta</span>
                  <span className="font-semibold text-gray-900">100%</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 text-center">
                    Usuário verificado via Clerk
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Portfolio */}
        <div className="md:col-span-2 space-y-6">
          <section>
             <h2 className="text-xl font-bold text-gray-900 mb-4">Portfólio de Trabalhos</h2>
             {portfolioItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {portfolioItems.map(task => (
                    task.imageUrls.slice(0, 1).map((url, idx) => (
                      <div key={`${task.id}-${idx}`} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                        <Image 
                          src={url} 
                          alt={`Trabalho em: ${task.title}`}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                           <span className="text-white text-xs font-medium truncate w-full">{task.title}</span>
                        </div>
                      </div>
                    ))
                  ))}
                </div>
             ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                  <p>Nenhum trabalho com fotos exibido ainda.</p>
                </div>
             )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Avaliações</h2>
            <div className="space-y-4">
              {profile.reviewsReceived.length > 0 ? (
                profile.reviewsReceived.map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                             {review.reviewer.avatarUrl && (
                                <Image src={review.reviewer.avatarUrl} alt="Reviewer" width={32} height={32} />
                             )}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{review.reviewer.name}</span>
                       </div>
                       <span className="text-xs text-gray-500">
                         {new Date(review.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
                  <p>Este profissional ainda não recebeu avaliações.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Contact/Actions (Mobile Sticky or Sidebar) */}
        <div className="md:block hidden">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Interessado?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Convide {profile.name.split(' ')[0]} para realizar um serviço para você.
              </p>
              <Link 
                href="/tasks/new" 
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                Solicitar Orçamento
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
