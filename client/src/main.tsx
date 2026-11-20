import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'
import router from './app/router'
import { AuthProvider } from './features/auth/AuthProvider'
import { WorkspaceProvider } from './features/workspaces/WorkspaceContext'
import { ThemeProvider } from "./context/ThemeProvider";
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <ThemeProvider>
    <AuthProvider>
      <WorkspaceProvider>
        <RouterProvider router={router} />
      </WorkspaceProvider>
    </AuthProvider>
  </ThemeProvider>
  </React.StrictMode>,
)