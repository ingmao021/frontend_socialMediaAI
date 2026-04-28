# Conexión Frontend → Backend

Mapa completo de todos los archivos del frontend que se comunican con el backend, directa o indirectamente.

---

## Variable de entorno requerida

```env
# .env
VITE_API_URL=http://localhost:8080
```

Todos los requests HTTP pasan por `src/api/client.ts`, que lee esta variable como `baseURL`.

---

## 1. Capa de infraestructura HTTP

### `src/api/client.ts`
Instancia de Axios compartida por todos los módulos de API.

| Responsabilidad | Detalle |
|---|---|
| `baseURL` | `VITE_API_URL` (desde `.env`) |
| Autenticación | Interceptor de request: agrega `Authorization: Bearer <jwt_token>` desde `localStorage` |
| Expiración de sesión | Interceptor de response: si el backend responde con código `TOKEN_EXPIRADO` o `TOKEN_INVALIDO`, limpia el token y redirige a `/login` |

---

## 2. Módulos de API (llamadas directas al backend)

### `src/api/auth.api.ts`

| Función | Método | Endpoint | Descripción |
|---|---|---|---|
| `getGoogleLoginUrl()` | `GET` | `/api/auth/google-url` | Obtiene la URL de OAuth de Google para redirigir al usuario |
| `getCurrentUser()` | `GET` | `/api/auth/me` | Retorna el perfil del usuario autenticado (`id`, `name`, `email`, `picture`) |
| `checkStatus()` | `GET` | `/api/auth/status` | Verifica si la sesión actual es válida |

---

### `src/api/videos.api.ts`

| Función | Método | Endpoint | Body / Params | Descripción |
|---|---|---|---|---|
| `generateVideo(data)` | `POST` | `/api/videos/generate` | `{ title, prompt, description? }` | Inicia la generación asíncrona de un video con IA |
| `getVideo(id)` | `GET` | `/api/videos/:id` | — | Consulta el estado actual de un video (usado para polling) |
| `listVideos()` | `GET` | `/api/videos` | — | Lista todos los videos del usuario autenticado |
| `deleteVideo(id)` | `DELETE` | `/api/videos/:id` | — | Elimina un video (no se usa en la UI actual) |

---

### `src/api/youtube.api.ts`

| Función | Método | Endpoint | Body / Params | Descripción |
|---|---|---|---|---|
| `publishToYouTube(data)` | `POST` | `/api/youtube/publish` | `{ videoId, title, description?, visibility }` | Publica un video completado en YouTube |
| `getUploadStatus(id)` | `GET` | `/api/youtube/uploads/:id` | — | Consulta el estado de una publicación de YouTube |
| `listUploads()` | `GET` | `/api/youtube/uploads` | — | Lista todas las publicaciones del usuario |
| `deleteUpload(id)` | `DELETE` | `/api/youtube/uploads/:id` | — | Elimina un registro de publicación |

---

## 3. Archivos que consumen los módulos de API

### `src/store/authStore.ts`
- Usa: `getCurrentUser()`, `removeToken()`
- Cuándo: en `fetchUser()` al cargar la app (`App.tsx` lo llama en `useEffect`)
- Almacena el usuario en Zustand; expone `user`, `loading`, `logout`

---

### `src/modules/auth/AuthCallback.tsx`
- **No usa Axios directamente**
- Recibe el JWT como query param `?token=...` al regresar del flujo OAuth de Google
- Lo guarda en `localStorage` con la key `jwt_token` y redirige a `/dashboard`

---

### `src/modules/video/useVideoPolling.ts`
- Usa: `getVideo(id)`
- Cuándo: polling cada **10 segundos** mientras el video está en estado `PENDING` o `PROCESSING`
- Se detiene automáticamente cuando el status es `COMPLETED` o `ERROR`

---

### `src/pages/LoginPage.tsx`
- Usa: `getGoogleLoginUrl()`
- Cuándo: al hacer click en "Continuar con Google"

---

### `src/pages/DashboardPage.tsx`
- Usa: `listVideos()`
- Cuándo: al montar la página, para calcular las 4 métricas del dashboard y mostrar videos recientes

---

### `src/pages/GeneratePage.tsx`
- Usa: `generateVideo(form)` + (indirectamente) `getVideo(id)` via `useVideoPolling`
- Cuándo: al enviar el formulario; el polling arranca automáticamente con el ID del video creado

---

### `src/pages/HistoryPage.tsx`
- Usa: `listVideos()`
- Cuándo: al montar la página para mostrar el historial completo

---

### `src/modules/youtube/PublishModal.tsx`
- Usa: `publishToYouTube({ videoId, title, description, visibility })`
- Cuándo: al confirmar la publicación en el modal

---

### `src/modules/video/VideoList.tsx` _(componente auxiliar)_
- Usa: `listVideos()`
- Cuándo: al montar (uso alternativo a `HistoryPage`)

---

### `src/modules/youtube/UploadList.tsx` _(componente auxiliar)_
- Usa: `listUploads()`
- Cuándo: al montar (no integrado en ninguna página actual, disponible para usar)

---

## 4. Utilidades de soporte

### `src/utils/token.utils.ts`
No hace llamadas HTTP. Gestiona el JWT en `localStorage`:

| Función | Acción |
|---|---|
| `saveToken(token)` | Guarda el JWT |
| `getToken()` | Lee el JWT |
| `removeToken()` | Elimina el JWT (logout) |
| `isAuthenticated()` | `true` si existe el token |

---

### `src/hooks/useApi.ts`
Hook genérico reutilizable que envuelve cualquier función async del API con estados `{ data, loading, error }`. No hace llamadas directas; delega en los módulos de API.

---

### `src/types/error.types.ts`
Define la forma estándar de todos los errores del backend:

```ts
interface ApiErrorResponse {
  timestamp: string;  // ISO-8601
  status: number;
  error: string;      // Ej: "Bad Request"
  code: string;       // Ej: "TOKEN_EXPIRADO", "VIDEO_NOT_FOUND"
  message: string;
  path: string;
}
```

---

## 5. Mapa visual de dependencias

```
App.tsx
 └── authStore.fetchUser()
       └── auth.api → GET /api/auth/me

LoginPage
 └── auth.api → GET /api/auth/google-url
                     │
                     ▼ (redirect a Google OAuth)
AuthCallback ◄── ?token=... (backend redirige aquí)
 └── guarda JWT en localStorage

DashboardPage
 └── videos.api → GET /api/videos

GeneratePage
 ├── videos.api → POST /api/videos/generate
 ├── useVideoPolling
 │     └── videos.api → GET /api/videos/:id  (cada 10s)
 └── PublishModal
       └── youtube.api → POST /api/youtube/publish

HistoryPage
 ├── videos.api → GET /api/videos
 └── PublishModal
       └── youtube.api → POST /api/youtube/publish

client.ts (Axios)  ◄── todos los módulos de API pasan por aquí
 ├── Agrega Bearer token en cada request
 └── Redirige a /login si token expirado
```

---

## 6. Flujo de autenticación completo

```
1. Usuario hace click en "Continuar con Google"
2. Frontend llama GET /api/auth/google-url  →  recibe URL de Google
3. window.location.href = url  →  redirect a Google
4. Google autentica y redirige a /auth/callback?token=<JWT>
5. AuthCallback.tsx lee el token y lo guarda en localStorage
6. Redirect a /dashboard
7. App.tsx llama authStore.fetchUser()  →  GET /api/auth/me  →  guarda user en Zustand
8. Todas las rutas protegidas leen user desde el store
9. Cada request siguiente lleva  Authorization: Bearer <JWT>
```
