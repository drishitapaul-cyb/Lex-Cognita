import React from "react";

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("App Crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'white', background: '#111', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#ff4444' }}>[SYSTEM_ERROR_HALT]</h2>
          <pre style={{ fontSize: 10, opacity: 0.5, maxWidth: '80%', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Attempt System Reset
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
