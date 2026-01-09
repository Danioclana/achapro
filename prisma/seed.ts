import { PrismaClient, Role, TaskStatus, ProposalStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. Clean up existing data
  console.log('Cleaning up existing data...')
  await prisma.message.deleteMany()
  await prisma.match.deleteMany()
  await prisma.review.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.task.deleteMany()
  await prisma.profile.deleteMany()

  // 2. Create Clients
  const clientsData = [
    {
      id: 'user_client_01',
      name: 'Ana Silva',
      role: Role.CLIENT,
      bio: 'Adoro reformar minha casa.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Silva&background=random',
      task: {
        title: 'Troca de Janelas',
        description: 'Preciso trocar 3 janelas de madeira por alumínio. As janelas atuais estão com cupim e precisam ser removidas com cuidado.',
        category: 'Reformas',
        location: 'Vila Mariana, São Paulo',
        imageUrls: ['/seed-images/trocar 3 janelas na minha casa.jpg'],
      }
    },
    {
      id: 'user_client_02',
      name: 'Carlos Souza',
      role: Role.CLIENT,
      bio: 'Ocupado demais para cuidar do jardim.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Souza&background=random',
      task: {
        title: 'Corte de Grama',
        description: 'Jardim da frente e fundos, aprox 50m². Precisa aparar arbustos também.',
        category: 'Manutenção',
        location: 'Morumbi, São Paulo',
        imageUrls: ['/seed-images/precisando cortar a grama.jpeg'],
      }
    },
    {
      id: 'user_client_03',
      name: 'Beatriz Oliveira',
      role: Role.CLIENT,
      bio: 'Gamer e streamer.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Beatriz+Oliveira&background=random',
      task: {
        title: 'Limpeza de PC Gamer',
        description: 'Meu computador está superaquecendo, preciso de limpeza interna completa e troca de pasta térmica de qualidade.',
        category: 'Tecnologia',
        location: 'Centro, São Paulo',
        imageUrls: ['/seed-images/pc precisando de limpeza.webp'],
      }
    },
    {
      id: 'user_client_04',
      name: 'Eduardo Santos',
      role: Role.CLIENT,
      bio: 'Pai de família.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Eduardo+Santos&background=random',
      task: {
        title: 'Vazamento na Cozinha',
        description: 'Cano da pia pingando muito, parece estar estourado dentro da parede. Preciso urgente.',
        category: 'Manutenção',
        location: 'Moema, São Paulo',
        imageUrls: ['/seed-images/preciso de um encanador (vazamento de agua no cano).webp'],
      }
    },
    {
      id: 'user_client_05',
      name: 'Fernanda Costa',
      role: Role.CLIENT,
      bio: 'Mudando de apartamento.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Fernanda+Costa&background=random',
      task: {
        title: 'Mudar Guarda-Roupa',
        description: 'Preciso desmontar um guarda-roupa de 6 portas e montar no quarto ao lado. Ele é bem grande e pesado.',
        category: 'Montagem',
        location: 'Pinheiros, São Paulo',
        imageUrls: ['/seed-images/preciso trocar o guarda roupa de lugar (desmontar e montar).webp'],
      }
    },
    {
      id: 'user_client_06',
      name: 'Gabriel Lima',
      role: Role.CLIENT,
      bio: 'Recém casado.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Gabriel+Lima&background=random',
      task: {
        title: 'Montagem de Móveis Novos',
        description: 'Comprei uma estante e um rack na internet, preciso de montagem profissional para não estragar.',
        category: 'Montagem',
        location: 'Tatuapé, São Paulo',
        imageUrls: ['/seed-images/A-experiencia-do-cliente-nao-termina-na-venda-montagem-de-moveis-plataforma-setor-moveleiro-1.png'],
      }
    },
  ]

  const createdTasks = []

  console.log('Creating clients and tasks...')
  for (const client of clientsData) {
    const createdProfile = await prisma.profile.create({
      data: {
        id: client.id,
        name: client.name,
        role: client.role,
        bio: client.bio,
        avatarUrl: client.avatarUrl,
      }
    })

    const createdTask = await prisma.task.create({
      data: {
        clientId: createdProfile.id,
        title: client.task.title,
        description: client.task.description,
        category: client.task.category,
        location: client.task.location,
        imageUrls: client.task.imageUrls,
        status: TaskStatus.OPEN,
      }
    })
    createdTasks.push(createdTask)
  }

  // 3. Create Providers
  const providersData = [
    {
      id: 'user_provider_01',
      name: 'Marcos Reparos',
      role: Role.PROVIDER,
      bio: 'Especialista em elétrica e hidráulica.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Marcos+Reparos&background=random',
    },
    {
      id: 'user_provider_02',
      name: 'Soluções Tech',
      role: Role.PROVIDER,
      bio: 'Assistência técnica para computadores e celulares.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Solucoes+Tech&background=random',
    },
    {
      id: 'user_provider_03',
      name: 'Jardinagem & Paisagismo',
      role: Role.PROVIDER,
      bio: 'Deixamos seu jardim impecável.',
      avatarUrl: 'https://ui-avatars.com/api/?name=Jardinagem&background=random',
    },
  ]

  const createdProviders = []
  console.log('Creating providers...')
  for (const provider of providersData) {
    const p = await prisma.profile.create({
      data: {
        id: provider.id,
        name: provider.name,
        role: provider.role,
        bio: provider.bio,
        avatarUrl: provider.avatarUrl,
      }
    })
    createdProviders.push(p)
  }

  // 4. Create Proposals
  // Task 2 (Corte de Grama) gets a proposal from Provider 3
  const taskCorteGrama = createdTasks.find(t => t.title === 'Corte de Grama')
  const providerJardineiro = createdProviders.find(p => p.name === 'Jardinagem & Paisagismo')

  if (taskCorteGrama && providerJardineiro) {
    await prisma.proposal.create({
      data: {
        taskId: taskCorteGrama.id,
        providerId: providerJardineiro.id,
        price: 80.00,
        description: 'Serviço completo incluindo limpeza da calçada. Disponibilidade para amanhã.',
        status: ProposalStatus.PENDING,
      }
    })
  }

  // Task 3 (Limpeza PC) gets a proposal from Provider 2
  const taskPC = createdTasks.find(t => t.title === 'Limpeza de PC Gamer')
  const providerTech = createdProviders.find(p => p.name === 'Soluções Tech')

  if (taskPC && providerTech) {
    await prisma.proposal.create({
      data: {
        taskId: taskPC.id,
        providerId: providerTech.id,
        price: 150.00,
        description: 'Limpeza com ar comprimido e troca de pasta térmica Arctic Silver. Busco e entrego.',
        status: ProposalStatus.PENDING,
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
