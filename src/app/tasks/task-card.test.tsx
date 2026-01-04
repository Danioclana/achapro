import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TaskCard from './task-card'

const mockTask = {
  id: '1',
  title: 'Conserto de Vazamento',
  category: 'Encanamento',
  location: 'São Paulo, SP',
  createdAt: new Date(),
  imageUrls: [],
  _count: {
    proposals: 3
  }
}

describe('TaskCard', () => {
  it('renders task basic information correctly', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.getByText('Conserto de Vazamento')).toBeInTheDocument()
    expect(screen.getByText('Encanamento')).toBeInTheDocument()
    expect(screen.getByText('📍 São Paulo, SP')).toBeInTheDocument()
    expect(screen.getByText('3 propostas')).toBeInTheDocument()
  })

  it('shows placeholder when no images are provided', () => {
    render(<TaskCard task={mockTask} />)
    
    expect(screen.getByText('Sem foto')).toBeInTheDocument()
  })

  it('renders the first image when provided', () => {
    const taskWithImage = {
      ...mockTask,
      imageUrls: ['https://example.com/image.jpg']
    }
    
    render(<TaskCard task={taskWithImage} />)
    
    const image = screen.getByAltText('Conserto de Vazamento')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src')
    // Next.js Image component transforms the src, so we just check it exists or contains part of it
    expect(screen.queryByText('Sem foto')).not.toBeInTheDocument()
  })

  it('links to the correct task detail page', () => {
    render(<TaskCard task={mockTask} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/tasks/1')
  })
})
