import React from 'react';

// Catches render-time crashes anywhere in the tree so a component error shows
// a recovery screen instead of a blank white page. "Reset saved data" exists
// because a corrupted saved roster in localStorage would otherwise crash the
// app again on every reload.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EduKit crashed:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetData = () => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('edukit_mis_'))
        .forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Failed to clear saved data:', e);
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'inherit'
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-card, #1e293b)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            color: 'var(--text-main, #f1f5f9)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Something went wrong
          </h1>
          <p
            style={{
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              marginBottom: '1.75rem'
            }}
          >
            SISD EduKit hit an unexpected error. Reloading usually fixes it. If the
            app keeps crashing after a reload, your saved roster data may be
            corrupted — use "Reset saved data" to clear it and start fresh (you can
            re-upload your spreadsheet afterwards).
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReload}
              style={{
                background: 'var(--primary, #e10031)',
                color: '#fff',
                border: 'none',
                padding: '0.7rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Reload App
            </button>
            <button
              onClick={this.handleResetData}
              style={{
                background: 'transparent',
                color: 'var(--text-muted, #94a3b8)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                padding: '0.7rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Reset saved data
            </button>
          </div>
        </div>
      </div>
    );
  }
}
