import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './AuthContext'
import { AudioPlayerProvider } from './AudioPlayerContext'
import { AudioProgressProvider } from './AudioProgressContext'
import { FavoritesProvider } from './FavoritesContext'
import { WatchProgressProvider } from './WatchProgressContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AudioProgressProvider>
        <AudioPlayerProvider>
          <FavoritesProvider>
            <WatchProgressProvider>
              <App />
            </WatchProgressProvider>
          </FavoritesProvider>
        </AudioPlayerProvider>
      </AudioProgressProvider>
    </AuthProvider>
  </StrictMode>,
)
