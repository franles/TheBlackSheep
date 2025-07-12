import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
//Punto de entrada del frontend (ReactDOM.render).
//Casi no lo vas a tocar salvo para envolver con <BrowserRouter> o <AuthProvider>.