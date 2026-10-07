import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /du-an/<slug>, /mau/<slug> (có hoặc không dấu / cuối) → public/<du-an|mau>/<slug>/index.html (trang tĩnh).
// Trên Vercel việc này do vercel.json đảm nhiệm; plugin chỉ để chạy dev/preview giống production.
const projectPages = () => {
  const rewrite = (req, _res, next) => {
    const m = req.url.match(/^\/(du-an|mau)\/([\w-]+)\/?(\?.*)?$/)
    if (m) req.url = `/${m[1]}/${m[2]}/index.html${m[3] || ''}`
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
  // khi phát triển: API chạy riêng (npm run dev:api, cổng 8080)
  server: { port: Number(process.env.VITE_PORT) || 5180, proxy: { '/api': process.env.API_URL || 'http://localhost:8080' } },
})
