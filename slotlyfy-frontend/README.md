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
│   ├── tokenStore.js   # localStorage: token, sesión, perfiles cacheados
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

`POST /api/auth/login` devuelve **únicamente `{ token }`**. El interceptor de
`lib/api.js` añade `Authorization: Bearer <token>` a todas las peticiones y, en la
sesión persistente, guarda token + usuario + rol.

### El rol no viene en el JWT

El token del backend sólo contiene `sub` (el email), `iat` y `exp`: **no lleva rol**, y
tampoco existe un endpoint de "usuario actual" contra el que recuperarlo al recargar la
página. Además, `POST /api/users` **siempre** crea un `CLIENT`, así que por API no hay
forma de convertirse en propietario.

Cómo lo resuelve este frontend:

1. Al registrarse, la respuesta de `POST /api/users` **sí** trae `role`, así que se
   cachea un perfil por email en `localStorage` (`slotlyfy.profiles`).
2. Al hacer login se recupera ese perfil por email y se reconstruye la sesión con su rol.
   Si no hay perfil cacheado (te registraste en otro navegador), se asume `CLIENT`.
3. El menú de usuario tiene **"Modo propietario"**, que fuerza el rol en el navegador
   para poder enseñar el panel en una demo. Cuando está activo se muestra un aviso
   amarillo en la cabecera. **No es una autorización**: es sólo una llave de interfaz, y
   las peticiones que hagas seguirán saliendo con tu rol real.

Si prefieres el comportamiento estricto, quita el interruptor en `Navbar.jsx`; el guard
de rutas seguirá funcionando con el rol del perfil cacheado.

## Decisiones marcadas por el backend

Lo siguiente no son preferencias de diseño: son huecos del API que condicionan la UI.

| Hueco del backend | Cómo lo resuelve el frontend |
| --- | --- |
| `GET /api/businesses` exige `category` (sin valor por defecto → 400 si se omite) y sólo acepta coincidencia exacta ignorando mayúsculas | "Todos" pide la primera página de **las 10 categorías en paralelo** y pagina en cliente sobre la unión deduplicada. Con filtro, la paginación es la real del servidor. |
| `category` es texto libre: no hay enum ni endpoint que las liste | `lib/domain.js` define las 10 categorías y es la **única fuente de verdad**: alimenta el filtro de clientes y el selector del alta de negocio, así que los valores siempre cuadran. |
| No hay `GET /api/businesses/{id}` | La ficha se recupera del catálogo en memoria. |
| No hay "mis negocios" (`findByOwner` existe pero no se expone) | `findMyBusinesses` barre el catálogo y compara por `ownerName`. Si no encuentra nada, el panel ofrece un selector manual. |
| Sin token **403** con cuerpo vacío (no 401), token caducado **500** porque el filtro JWT no captura la excepción, y **el mismo 403 vacío** cuando el token es válido pero faltan permisos | El interceptor sólo da la sesión por perdida si **no** enviamos token (o si llega 401/500), y distingue los casos con la marca `hadToken`. Así un 403 por permisos muestra "No tienes permiso para esta acción" **sin** expulsar al usuario, que es lo que ocurre al usar el panel en modo demo. |
| No se devuelven los mensajes de Bean Validation (sin handler y `include-message=never`) | Todos los formularios validan en cliente: precio ≥ 0,10, duración ≥ 30 min, rating 1-5, fecha futura, email… |
| Los errores de negocio llegan en inglés y en texto plano | `lib/errors.js` los traduce a español y añade mensajes para red caída, 403 y 500. |
| `LocalTime` llega como `"09:00"` (sin segundos) y `LocalDateTime` los exige | `normalizeSlot` / `buildAppointmentDateTime` completan los segundos antes de enviar la cita. |
| `GET /api/businesses/{id}/services` y `/employees` sólo devuelven lo activo | Un servicio desactivado deja de listarse; el panel lo avisa. |
| `PATCH /api/services/{id}` ignora el campo `name` | No hay edición de servicios en la UI, sólo alta y activar/desactivar. |
| No hay filtro por estado en los listados paginados | Los chips de estado filtran la página cargada, y así se indica en la interfaz. |
| No hay actualización ni borrado de negocio | La ficha es de sólo lectura una vez creada. |
| `GET /api/businesses/{id}/appointments` también exige rol de propietario | Con una cuenta CLIENT la pestaña Citas del panel recibe 403 y lo avisa con un mensaje; sólo se puede listar con una cuenta real de propietario. |
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
