import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /du-an/<slug> và /du-an/<slug>/ → public/du-an/<slug>/index.html (trang tĩnh của dự án đã triển khai).
// Trên Vercel việc này do vercel.json đảm nhiệm; plugin chỉ để chạy dev/preview giống production.
const projectPages = () => {
  const rewrite = (req, _res, next) => {
    const m = req.url.match(/^\/du-an\/([\w-]+)\/?(\?.*)?$/)
    if (m) req.url = `/du-an/${m[1]}/index.html${m[2] || ''}`
    next()
  }
  return {
    name: 'project-pages',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

export default defineConfig({
  plugins: [react(), projectPages()],
  server: { port: Number(process.env.PORT) || 5180 },
})
