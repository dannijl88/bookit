import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { API_URL } from './lib/constants'

/**
 * Despierta el backend en cuanto alguien abre la web.
 *
 * El backend en Render (plan gratuito) se duerme tras 15 min sin tráfico y la
 * primera petición puede tardar cerca de un minuto. Lanzamos un GET a
 * /actuator/health "fire-and-forget": con `mode: 'no-cors'` no depende de CORS,
 * no hace preflight, ignora la respuesta (que además será opaca) y cualquier
 * error. No se espera, así que no bloquea el render.
 */
function warmUpBackend() {
  fetch(`${API_URL}/actuator/health`, { mode: 'no-cors' }).catch(() => {})
}

warmUpBackend()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
