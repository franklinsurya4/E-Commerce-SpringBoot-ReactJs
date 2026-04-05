import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 App Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: 'var(--bg-primary, #f5f5f5)'
        }}>
          <div style={{
            maxWidth: 500,
            background: 'var(--bg-card, #fff)',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>💥</div>
            <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary, #333)' }}>
              Something went wrong
            </h2>
            <p style={{ margin: '0 0 16px', color: 'var(--text-muted, #666)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                background: '#f8f9fa',
                padding: 12,
                borderRadius: 8,
                textAlign: 'left',
                fontSize: '0.85rem',
                marginBottom: 16,
                maxHeight: 200,
                overflow: 'auto'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
                  Error Details (Dev Only)
                </summary>
                <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReload}
              style={{
                background: 'var(--primary, #007bff)',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 8,
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}