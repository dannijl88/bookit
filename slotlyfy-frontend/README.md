# Slotlyfy · Frontend

Frontend de **Slotlyfy**, plataforma SaaS de reservas multi-negocio (peluquerías,
barberías, spas y negocios de servicios). Consume el backend Spring Boot que corre en
`http://localhost:8080`.

Proyecto **independiente**: no comparte nada con el backend más allá de la API HTTP.

## Stack

- **React 19** + **Vite 8**
- **React Router 7** (modo declarativo)
- **Tailwind CSS 4** (vía `@tailwindcss/vite`, sin `tailwind.config.js`: los tokens
  viven en `@theme` dentro de `src/index.css`)
- **axios** con interceptor de token
- **Context API** para autenticación y para el negocio del propietario
- JavaScript + JSX, sin TypeScript

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:5173
```

El backend necesita estar en marcha (`http://localhost:8080`). La URL se puede cambiar
en `.env`:

```
VITE_API_URL=http://localhost:8080
```

> **El puerto 5173 es obligatorio.** El `CorsConfig` del backend sólo permite el origen
> `http://localhost:5173`. Por eso `vite.config.js` fija el puerto con `strictPort: true`:
> si el 5173 estuviera ocupado y Vite elegía el 5174, *todas* las llamadas fallarían
> por CORS en lugar de avisarte claramente.

### Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el 5173 |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build en el 5173 |
| `npm run lint` | ESLint |
| `npm run verify:logic` | Comprueba fechas, slots y paginación (sin backend) |
| `npm run verify:contract` | Comprueba el contrato HTTP contra un backend simulado |
| `npm run verify` | `lint` + las dos verificaciones |

### Docker

El `Dockerfile` construye el bundle con `npm ci` + `npm run build` y lo sirve con
Nginx (con fallback de SPA para las rutas de React Router). La URL de la API se
inyecta en build-time con el build-arg `VITE_API_URL`:

```bash
docker build -t slotlyfy-frontend --build-arg VITE_API_URL=http://localhost:8080 .
docker run -p 5173:80 slotlyfy-frontend
```

Normalmente no lo construirás a mano: se levanta junto al backend y MySQL con el
`docker-compose.yml` de la raíz del repositorio (`docker compose up --build`).

`verify:contract` levanta un servidor que imita las respuestas del backend real y comprueba
rutas, query params, cuerpos, Page<T> y errores. Usa un puerto propio (8099 por defecto,
configurable con `CONTRACT_PORT`), de modo que se puede ejecutar con el backend real
levantado en el 8080.

## Estructura

```
src/
├── api/                # una capa fina por dominio; ninguna función conoce React
│   ├── auth.js         #   login, registro
│   ├── businesses.js   #   listado, servicios, empleados, reseñas, citas del negocio
│   ├── appointments.js #   disponibilidad, crear cita, mis citas, estados
│   ├── owner.js        #   empleados, horarios, servicios del propietario
│   └── reviews.js
├── auth/
│   ├── tokenStore.js   # localStorage: token y sesión (token + usuario + rol)
│   └── AuthContext.jsx # login / register / logout / rol en React
├── components/
│   ├── layout/         # Layout, Navbar, Footer
│   └── ui/             # Button, FormControls, Card, Modal, Pagination, Feedback…
├── hooks/
│   ├── useAsync.js     # carga con loading/error, ignora respuestas obsoletas
│   └── useToast.jsx    # avisos emergentes
├── lib/
│   ├── api.js          # instancia de axios + interceptor del token
│   ├── constants.js    # URL de la API, claves de storage, tamaños de página
│   ├── domain.js       # categorías, estados, días, roles
│   ├── errors.js       # normaliza los 3 formatos de error del backend a español
│   ├── format.js       # fechas, moneda, slots
│   └── pagination.js   # Page<T> de Spring Data
├── pages/
│   ├── HomePage.jsx
│   ├── auth/           # login, registro
│   ├── businesses/     # listado, ficha, flujo de reserva
│   ├── client/         # mis citas, reseña
│   └── owner/          # panel de negocio
└── routes/guards.jsx   # ProtectedRoute, RoleRoute, GuestRoute
```

## Rutas

| Ruta | Acceso | Pantalla |
| --- | --- | --- |
| `/` | público | Portada |
| `/businesses` | público | Listado con filtro por categoría + paginación |
| `/businesses/:id` | público | Ficha: servicios, equipo, reseñas, reservar |
| `/login`, `/registro` | invitados | Acceso y alta |
| `/mis-citas` | con sesión | Citas del cliente, cancelar y reseñar |
| `/panel` | `BUSINESS_OWNER` | Ficha del negocio (resumen o alta) |
| `/panel/servicios` | `BUSINESS_OWNER` | Alta y desactivación de servicios |
| `/panel/equipo` | `BUSINESS_OWNER` | Empleados y horario semanal |
| `/panel/citas` | `BUSINESS_OWNER` | Citas del negocio y cambio de estado |

## Autenticación

`POST /api/auth/login` devuelve `{ token, userId, role }`. El interceptor de `lib/api.js`
añade `Authorization: Bearer <token>` a todas las peticiones, y la sesión (token + usuario +
rol) se persiste en `localStorage` para pintar la interfaz al instante al recargar.

### Perfil y rol

El perfil completo se recupera con `GET /api/users/me`, que incluye el `role` real. Al
cargar la app, si hay token, el `AuthContext` revalida la sesión guardada contra ese
endpoint; si el token ya no vale, el interceptor limpia la sesión.

En el registro (`POST /api/users`) el usuario elige explícitamente su rol: `CLIENT` (para
reservar) o `BUSINESS_OWNER` (para publicar y gestionar un negocio). El backend rechaza
cualquier otro valor.

## Decisiones marcadas por el backend

Lo siguiente no son preferencias de diseño: son huecos del API que condicionan la UI.

| Hueco del backend | Cómo lo resuelve el frontend |
| --- | --- |
| `GET /api/businesses` exige `category` (sin valor por defecto → 400 si se omite) y sólo acepta coincidencia exacta ignorando mayúsculas | "Todos" pide la primera página de **las 10 categorías en paralelo** y pagina en cliente sobre la unión deduplicada. Con filtro, la paginación es la real del servidor. |
| `category` es texto libre: no hay enum ni endpoint que las liste | `lib/domain.js` define las 10 categorías y es la **única fuente de verdad**: alimenta el filtro de clientes y el selector del alta de negocio, así que los valores siempre cuadran. |
| No hay `GET /api/businesses/{id}` | La ficha se recupera del catálogo en memoria. |
| "Mis negocios" expuesto como `GET /api/businesses/mine` (sólo `BUSINESS_OWNER`) | `OwnerContext` lo llama al entrar al panel; si el propietario tiene varios negocios, se elige con un selector y se recuerda el último en `localStorage`. |
| Sesión no válida responde **401** (falta el token o ha caducado) y los **403** son falta de permisos | El interceptor cierra la sesión sólo ante un **401** (salvo en `POST /api/auth/login`, cuyas credenciales erróneas también son 401). Un **403** muestra "No tienes permiso para esta acción" **sin** expulsar al usuario. |
| Los errores de validación y de negocio llegan con un mensaje legible | Los formularios validan igualmente en cliente para dar feedback inmediato: precio ≥ 0,10, duración ≥ 30 min, rating 1-5, fecha futura, email… |
| Los errores de negocio llegan en inglés y en texto plano | `lib/errors.js` los traduce a español y añade mensajes para red caída, 403 y 500. |
| `LocalTime` llega como `"09:00"` (sin segundos) y `LocalDateTime` los exige | `normalizeSlot` / `buildAppointmentDateTime` completan los segundos antes de enviar la cita. |
| `GET /api/businesses/{id}/services` y `/employees` sólo devuelven lo activo | Un servicio desactivado deja de listarse; el panel lo avisa. |
| `PATCH /api/services/{id}` permite editar, pero la UI aún no ofrece edición | Sólo alta y activar/desactivar servicios desde el panel. |
| No hay filtro por estado en los listados paginados | Los chips de estado filtran la página cargada, y así se indica en la interfaz. |
| El negocio se puede actualizar y (des)activar por API (`PATCH /api/businesses/{id}`, `/activate`, `/deactivate`), pero la UI aún no los usa | La ficha es de sólo lectura una vez creada. |
| `GET /api/businesses/{id}/appointments` también exige rol de propietario | Con una cuenta CLIENT la pestaña Citas del panel recibe un 403 y lo avisa con un mensaje; sólo se puede listar con una cuenta real de propietario. |
| El puerto 5173 es obligatorio | `CorsConfig` sólo permite el origen `http://localhost:5173`. Con cualquier otro puerto el preflight devuelve 403 y *ninguna* llamada llega al backend, así que `strictPort` está activado para que Vite falle en vez de moverse de puerto. |

## Diseño

- **Color de marca**: violeta (`brand-*` en `@theme`), con fondo `slate-50` y tarjetas
  blancas.
- **Tipografía**: Inter (Google Fonts) con fallback al sistema.
- **Responsive**: navegación con menú hamburguesa en móvil; el flujo de reserva es un
  modal a pantalla completa en pequeño y centrado en escritorio; rejillas de 1→2→3
  columnas según ancho.
- Sin dark mode ni animaciones complejas, como estaba previsto.

## Notas

- El backend cachea `GET /api/businesses` con una clave que **ignora el parámetro
  `sort`**, por lo que el orden puede venir obsoleto tras cambiarlo. El frontend no
  depende de un orden concreto.
- La disponibilidad se recalcula en cada apertura del flujo de reserva. El backend la
  vuelve a validar al crear la cita: si el hueco se acaba de ocupar llega un 409 y la
  interfaz recarga los horarios mostrando el aviso.
