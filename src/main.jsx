import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("KDS App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 30, color: '#fff', backgroundColor: '#0f172a', fontFamily: 'sans-serif', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: '#f59e0b', fontSize: '24px' }}>🍳 KDS Cozinha - Modulo em Recuperação</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', margin: '15px 0' }}>
            Ocorreu um ajuste temporário de inicialização. Clique abaixo para recarregar.
          </p>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ padding: '10px 20px', backgroundColor: '#06b6d4', border: 'none', borderRadius: '8px', color: '#090d16', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Recarregar KDS
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
