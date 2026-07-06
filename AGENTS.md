# Sistema de Control de Asistencia mediante Códigos QR

Centro Cristiano Boconó — Cúcuta, Colombia

## Stack

- **Framework**: Astro 5 (SSR) + React 19
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **BD**: PostgreSQL + Prisma ORM
- **Auth**: JWT + Cookies HttpOnly + bcryptjs
- **Validación**: Zod + React Hook Form
- **QR**: qrcode + html5-qrcode
- **Gráficos**: Recharts
- **Fechas**: dayjs
- **Exportación**: exceljs

## Requisitos

- Node.js >= 20
- PostgreSQL >= 14
- npm

## Setup

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL con tus credenciales de PostgreSQL

# 3. Crear la base de datos
npx prisma db push

# 4. Poblar con datos iniciales
npm run db:seed

# 5. Iniciar desarrollo
npm run dev
```

## Credenciales iniciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@ccb.org | admin123 |
| Registrador | registrar@ccb.org | registrar123 |

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa de build producción |
| `npm run db:generate` | Regenera Prisma Client |
| `npm run db:push` | Sincroniza schema con BD |
| `npm run db:migrate` | Crea migración |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run db:seed` | Ejecuta seed |
| `npm run lint` | TypeScript check |

## Estructura del proyecto

```
src/
├── modules/           # 8 módulos independientes
│   ├── auth/          # Autenticación
│   ├── members/       # Gestión de miembros
│   ├── events/        # Gestión de eventos
│   ├── attendance/    # Registro de asistencia
│   ├── qr/            # Generación de QR
│   ├── dashboard/     # Panel de control
│   ├── reports/       # Reportes
│   └── notifications/ # Notificaciones
├── shared/            # Código compartido
│   ├── database/      # Prisma singleton
│   ├── middleware/     # Auth + error handler
│   ├── errors/        # Clases de error
│   ├── utils/         # Utilidades (jwt, response, cn)
│   └── types/         # Tipos globales
├── pages/             # Rutas y API endpoints
│   ├── api/           # API REST por módulo
│   └── *.astro        # Páginas
├── layouts/           # Layouts base
├── components/ui/     # shadcn/ui
└── styles/            # Tailwind CSS v4
```

## Arquitectura

- **Monolito modular**: cada módulo es autocontenido (service + schema + components)
- **Server-first**: lógica de negocio solo en servidor
- **Thin routes**: API routes delegan en servicios
- **Validación dual**: Zod schemas compartidos (cliente y servidor)
- **Errores centralizados**: AppError → handler → response
- **Auth**: JWT en cookie HttpOnly, middleware `authenticate()` y `requireRole()`

## API REST

### Auth
- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/logout` — Cerrar sesión
- `POST /api/auth/register` — Registrar usuario (solo ADMIN)
- `GET /api/auth/me` — Usuario actual

### Members
- `GET /api/members?q=&role=&isActive=&page=&pageSize=`
- `POST /api/members`
- `GET /api/members/:id`
- `PUT /api/members/:id`
- `DELETE /api/members/:id` (soft delete)

### Events
- `GET /api/events?type=&isActive=&from=&to=&page=`
- `POST /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `POST /api/events/:id/activate`
- `GET /api/events/active`

### Attendance
- `POST /api/attendance/scan` — Escanear QR
- `GET /api/attendance?eventId=&memberId=&date=&page=`
- `POST /api/attendance` — Registro manual

### QR
- `GET /api/qr/:id` — Imagen PNG del QR
- `GET /api/qr/:id/credential` — Datos de la credencial

### Notifications
- `POST /api/notifications/send-credential` — Enviar credencial

### Dashboard
- `GET /api/dashboard` — Estadísticas del panel

### Reports
- `GET /api/reports?type=&format=&params...`

## Variables de entorno

Ver `.env` para todas las variables. Las principales:

- `DATABASE_URL` — Conexión a PostgreSQL
- `JWT_SECRET` — Secreto para firmar tokens
- `SMTP_HOST/USER/PASS` — Configuración de correo (opcional)
- `WHATSAPP_API_URL/TOKEN` — API de WhatsApp (opcional)
