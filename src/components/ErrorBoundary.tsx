import React, { Component, ReactNode } from 'react'
import { ErrorHandler } from '@/lib/errorHandler'
import { AppError } from '@/types/Error'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AppError) => void
}

interface State {
  hasError: boolean
  error: AppError | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: unknown): State {
    const appError = ErrorHandler.handle(error, {
      component: 'ErrorBoundary',
      action: 'getDerivedStateFromError'
    })

    return {
      hasError: true,
      error: appError,
      showDetails: false
    }
  }

  componentDidCatch(error: unknown) {
    const appError = ErrorHandler.handle(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      url: window.location.href
    })

    // Notificar callback se fornecido
    if (this.props.onError) {
      this.props.onError(appError)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      showDetails: false
    })
  }

  toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails
    }))
  }

  render() {
    const { hasError, error, showDetails } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // Se um fallback customizado foi fornecido, usar ele
      if (fallback) {
        return fallback
      }

      return <ErrorFallback 
        error={error} 
        showDetails={showDetails}
        onRetry={this.handleRetry}
        onToggleDetails={this.toggleDetails}
      />
    }

    return children
  }
} 