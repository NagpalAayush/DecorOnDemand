import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieParser from 'cookie-parser'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { initializeDatabase } from './src/config/database.js'
import { userRoutes } from './src/routes/userRoutes.js'
import { listingRoutes } from './src/routes/listingRoutes.js'
import { getAuthenticatedUser } from './src/auth/jwt.js'
import dotenv from 'dotenv'
dotenv.config();

const root = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT) || 5173

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

async function serveStaticFile(request, response) {
  const requestedPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  if (requestedPath === '/') {
    return false
  }

  const filePath = path.resolve(root, 'dist/client', `.${requestedPath}`)
  const clientRoot = path.resolve(root, 'dist/client')

  if (!filePath.startsWith(`${clientRoot}${path.sep}`)) {
    response.writeHead(403)
    response.end('Forbidden')
    return true
  }

  try {
    const file = await fs.readFile(filePath)
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    })
    response.end(file)
    return true
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
    return false
  }
}

async function createApp() {
  const vite = isProduction
    ? null
    : await createViteServer({
        root,
        server: { middlewareMode: true },
        appType: 'custom',
      })

  const app = express()
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api/users', userRoutes)
  app.use('/api/listings', listingRoutes)

  if (vite) {
    app.use(vite.middlewares)
  } else {
    app.use(async (request, response, next) => {
      try {
        if (await serveStaticFile(request, response)) {
          return
        }

        next()
      } catch (error) {
        next(error)
      }
    })
  }

  app.use(async (request, response, next) => {
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.status(405).set('Allow', 'GET, HEAD').send('Method Not Allowed')
        return
      }

      await renderPage(request, response, vite)
    } catch (error) {
      next(error)
    }
  })

  app.use((error, request, response, next) => {
    if (vite) {
      vite.ssrFixStacktrace(error)
    }

    console.error(error)
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({ error: 'Request body must be valid JSON.' })
      return
    }

    response.status(500).type('text').send('Internal Server Error')
  })

  return app
}

async function renderPage(request, response, vite = null) {
  const url = new URL(request.url, 'http://localhost').pathname
  let template
  let render

  if (vite) {
    template = await fs.readFile(path.resolve(root, 'index.html'), 'utf-8')
    template = await vite.transformIndexHtml(url, template)
    render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
  } else {
    template = await fs.readFile(path.resolve(root, 'dist/client/index.html'), 'utf-8')
    render = (await import('./dist/server/entry-server.js')).render
  }

  const authenticatedUser = getAuthenticatedUser(request.cookies?.token)
  const preloadedState = {
    user: {
      user: authenticatedUser,
      isLoggedIn: Boolean(authenticatedUser),
      loading: false,
    },
    cart: {
      items: [],
    },
  }
  const renderedApp = render(url, preloadedState)
  const serializedState = JSON.stringify(preloadedState)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  const stateScript = `<script>window.__PRELOADED_STATE__=${serializedState}</script>`
  const html = template.replace('<!--ssr-outlet-->', `${renderedApp}${stateScript}`)
  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.end(html)
}

await initializeDatabase()
const server = await createApp()
server.listen(port, () => {
  console.log(`SSR server running at http://localhost:${port}`)
})
