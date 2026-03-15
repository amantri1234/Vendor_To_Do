import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              background: '#0D0D0D',
              color: '#F5F2EB',
              borderRadius: '10px',
              padding: '10px 16px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#F5F2EB' } },
            error:   { iconTheme: { primary: '#E85D26', secondary: '#F5F2EB' } },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
