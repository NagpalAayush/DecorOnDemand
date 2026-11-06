import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'

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

  return http.createServer(async (request, response) => {
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' })
        response.end('Method Not Allowed')
        return
      }

      if (vite) {
        vite.middlewares(request, response, () => renderPage(request, response, vite))
        return
      }

      if (await serveStaticFile(request, response)) {
        return
      }

      await renderPage(request, response)
    } catch (error) {
      vite?.ssrFixStacktrace(error)
      console.error(error)
      response.writeHead(500, { 'Content-Type': 'text/plain' })
      response.end('Internal Server Error')
    }
  })
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

  const html = template.replace('<!--ssr-outlet-->', render(url))
  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.end(html)
}

const server = await createApp()
server.listen(port, () => {
  console.log(`SSR server running at http://localhost:${port}`)
})
