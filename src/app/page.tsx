import Link from "next/link"
import { Search, ShieldCheck, Zap } from "lucide-react"
import { auth } from "@clerk/nextjs/server"

export default async function LandingPage() {
  await auth()
  
  // Optional: Redirect logged in users to dashboard/tasks
  // if (userId) redirect("/tasks")

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Serviços que você precisa,</span>
                <span className="block text-blue-600">profissionais de confiança.</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Conecte-se com especialistas para reformas, limpeza, aulas e muito mais. 
                Rápido, seguro e sem burocracia.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/tasks/new"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                  >
                    Pedir um Serviço
                  </Link>
                  <Link
                    href="/tasks"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition"
                  >
                    Sou Profissional
                  </Link>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Cadastre-se grátis hoje mesmo.
                </p>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md overflow-hidden">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden h-96">
                     <div className="absolute top-0 left-0 w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-gray-500">
                        {/* Placeholder for Hero Image */}
                        <div className="text-center p-8">
                            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Encontre o profissional ideal</p>
                        </div>
                     </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Como funciona</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simples, do início ao fim
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Search className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">1. Descreva o Pedido</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-600">
                  Conte o que você precisa, adicione fotos e defina a localização. É rápido e fácil.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Zap className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">2. Receba Propostas</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-600">
                  Profissionais qualificados enviarão orçamentos. Compare preços e avaliações.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">3. Contrate com Segurança</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-600">
                  Aceite a melhor oferta, combine os detalhes pelo chat e avalie o serviço ao final.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Categories Grid (Optional) */}
      <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Categorias Populares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Limpeza', 'Manutenção', 'Aulas', 'Tecnologia', 'Reformas', 'Beleza', 'Eventos', 'Saúde'].map((cat) => (
                    <Link key={cat} href={`/tasks?category=${cat}`} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center border border-gray-100">
                        <span className="font-medium text-gray-700">{cat}</span>
                    </Link>
                ))}
            </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <span className="text-gray-600 hover:text-gray-700 transition">
              Instagram
            </span>
            <span className="text-gray-600 hover:text-gray-700 transition">
              Twitter
            </span>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-600">
              &copy; 2026 AchaPro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
