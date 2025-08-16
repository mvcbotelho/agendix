import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Logo } from '@/components/Logo'

describe('Logo', () => {
  it('should render logo image', () => {
    render(<Logo />)
    
    const logoImage = screen.getByAltText('Agendix Logo')
    expect(logoImage).toBeInTheDocument()
    expect(logoImage).toHaveAttribute('src')
  })

  it('should render logo with correct alt text', () => {
    render(<Logo />)
    
    const logoImage = screen.getByAltText('Agendix Logo')
    expect(logoImage).toBeInTheDocument()
  })

  it('should render logo with correct styling', () => {
    render(<Logo />)
    
    const logoImage = screen.getByAltText('Agendix Logo')
    expect(logoImage).toHaveClass('chakra-image')
  })
})
