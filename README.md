# bookshop-api

API REST construida con Node.js, Express 5, TypeScript y MongoDB.
Arquitectura por capas (rutas → controlador → servicio → repositorio).

## Instalación

```bash
npm install
cp .env.example .env   # ajusta MONGO_URI
```

## Ejecución

```bash
npm run dev            # desarrollo
npm run build && npm start   # producción
```

## Endpoints

Base URL: `http://localhost:3000/api/v1`

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/authors` | Crea un autor |
| GET | `/authors` | Lista autores |
| GET | `/authors/:id` | Consulta un autor |
| PUT | `/authors/:id` | Actualiza un autor |
| DELETE | `/authors/:id` | Elimina un autor |

Health check: `GET /health`
