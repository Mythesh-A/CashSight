/**
 * ErrorBoundary - React error boundary component
 */
import React from 'react'
import Button from './Button'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { fallback, children } = this.props

    if (hasError) {
      if (fallback) {
        return fallback(error, this.handleRetry)
      }

      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '40px auto',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💥</div>
          <h2 style={{ color: '#dc3545', margin: 0 }}>Something went wrong</h2>
          <p style={{ color: '#666', margin: '12px 0' }}>
            {error?.message || 'An unexpected error occurred'}
          </p>
          {process.env.NODE_ENV === 'development' && errorInfo && (
            <details style={{ textAlign: 'left', marginTop: '16px', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>Error details</summary>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
          <Button variant="primary" onClick={this.handleRetry} style={{ marginTop: '16px' }}>
            🔄 Try Again
          </Button>
        </div>
      )
    }

    return children
  }
}