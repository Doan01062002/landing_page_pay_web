# Triển khai ChungAuto lên VPS

Một máy chủ Node.js phục vụ cả **website** (dựng HTML phía máy chủ – tốt cho SEO), **API** và **trang quản trị `/admin`**; dữ liệu lưu trong **PostgreSQL** trên cùng VPS.

```
Trình duyệt ──HTTPS──> Caddy (80/443, chứng chỉ Let's Encrypt tự động)
                          └──> app: Node.js 22 (Express 5)  ──> PostgreSQL 17
                                 ├─ /            website, dựng HTML từ database (SSR)
                                 ├─ /admin       trang quản trị (đăng nhập)
                                 ├─ /api/*       API JSON
                                 └─ /assets, /du-an/*  tệp tĩnh
```

Yêu cầu VPS: Ubuntu 22.04/24.04, 1 vCPU, 1–2 GB RAM, tên miền đã trỏ bản ghi **A** (cả `@` và `www`) về IP của VPS.

## Cách 1 – Docker (khuyên dùng)

```bash
# 1. Cài Docker
curl -fsSL https://get.docker.com | sh

# 2. Lấy mã nguồn
sudo mkdir -p /opt/chungauto && sudo chown $USER /opt/chungauto
git clone https://github.com/Doan01062002/landing_page_pay_web.git /opt/chungauto
cd /opt/chungauto

# 3. Cấu hình
cp .env.example .env
nano .env        # sửa DOMAIN, DB_PASSWORD (chuỗi dài, chỉ chữ + số), ADMIN_EMAIL, ADMIN_PASSWORD

# 4. Chạy
docker compose up -d --build
docker compose logs -f app     # thấy "[web] ChungAuto đang chạy" là xong
```

Mở `https://<tên-miền>/admin`, đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`.

- Lần khởi động đầu tiên, máy chủ tự tạo bảng (migration), nạp Kho mẫu + hỏi đáp + cài đặt mặc định và tạo tài khoản quản trị.
- Tài khoản quản trị **chỉ được tạo khi email chưa tồn tại**; sửa `ADMIN_PASSWORD` sau đó không đổi mật khẩu. Đổi mật khẩu trong trang quản trị: menu tài khoản → **Đổi mật khẩu**.
- Nên đổi mật khẩu ngay sau lần đăng nhập đầu, rồi xoá `ADMIN_PASSWORD` khỏi `.env`.

### Cập nhật phiên bản mới

```bash
cd /opt/chungauto
git pull
docker compose up -d --build app
```

Migration mới (nếu có) tự chạy khi app khởi động.

### Sao lưu & khôi phục

```bash
sh scripts/backup.sh                       # tạo backups/chungauto-<thời gian>.sql.gz, giữ 14 ngày
crontab -e                                 # sao lưu tự động 3 giờ sáng mỗi ngày:
# 0 3 * * * cd /opt/chungauto && sh scripts/backup.sh >> backups/backup.log 2>&1

# khôi phục từ một bản sao lưu
gunzip -c backups/chungauto-20261007-030000.sql.gz | docker compose exec -T db psql -U chungauto -d chungauto
docker compose restart app
```

Nên chép thư mục `backups/` sang nơi khác (Google Drive, máy khác) định kỳ, ví dụ bằng `rclone`.

### Lệnh hay dùng

| Việc | Lệnh |
| --- | --- |
| Xem log | `docker compose logs -f app` |
| Khởi động lại | `docker compose restart app` |
| Vào database | `docker compose exec db psql -U chungauto -d chungauto` |
| Mở khoá tài khoản bị khoá do nhập sai | Trang quản trị → Tài khoản → **Mở khoá**, hoặc `UPDATE users SET locked_until = NULL, failed_attempts = 0 WHERE email = '…';` |
| Kiểm tra sống | `curl https://<tên-miền>/api/health` |

## Cách 2 – Không dùng Docker (Node.js + PM2)

```bash
# Node.js 22 và PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs postgresql
sudo -u postgres psql -c "CREATE USER chungauto WITH PASSWORD 'matkhaudb';" -c "CREATE DATABASE chungauto OWNER chungauto;"

# Mã nguồn
git clone https://github.com/Doan01062002/landing_page_pay_web.git /opt/chungauto && cd /opt/chungauto
npm ci && npm run build
cp .env.example .env && nano .env
#   DATABASE_URL=postgres://chungauto:matkhaudb@localhost:5432/chungauto
#   PUBLIC_URL=https://chungauto.vn
#   HOST=127.0.0.1  PORT=8080  + ADMIN_EMAIL / ADMIN_PASSWORD

# Chạy nền, tự bật lại khi khởi động máy
sudo npm i -g pm2
NODE_ENV=production pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
```

Đặt Caddy (hoặc Nginx) phía trước để có HTTPS: Caddyfile chỉ cần

```
chungauto.vn {
	encode zstd gzip
	reverse_proxy 127.0.0.1:8080
}
```

Sao lưu: `pg_dump -U chungauto -d chungauto | gzip > backup.sql.gz`.

## Cách 3 – Database trên Supabase (VPS chỉ chạy ứng dụng)

Supabase thay cho PostgreSQL trên VPS; máy chủ Node.js vẫn chạy trên VPS (Supabase/Vercel không chạy được backend Express này).

1. Supabase → dự án → nút **Connect** → tab **Direct** (*Connection string*) → mục **Session pooler** → kiểu **URI**, sao chép chuỗi dạng
   `postgresql://postgres.<mã-dự-án>:[YOUR-PASSWORD]@aws-0-<vùng>.pooler.supabase.com:5432/postgres`
   - Dùng **Session pooler** (cổng 5432): chạy được trên VPS chỉ có IPv4 và hỗ trợ khoá migration. **Không** dùng *Transaction pooler* (cổng 6543).
   - *Direct connection* (`db.<mã>.supabase.co`) chỉ dùng khi VPS có IPv6.
2. Thay `[YOUR-PASSWORD]` bằng mật khẩu database (đặt khi tạo dự án; quên thì: Project Settings → Database → *Reset database password*). Mật khẩu có ký tự đặc biệt (`@ : / ? # %`) phải mã hoá URL, vd `@` → `%40`.
3. `.env` trên VPS:
   ```
   DOMAIN=chungauto.vn
   DATABASE_URL=postgresql://postgres.<mã>:<mật-khẩu>@aws-0-<vùng>.pooler.supabase.com:5432/postgres
   DB_POOL_MAX=5
   ADMIN_EMAIL=...
   ADMIN_PASSWORD=...
   ```
   SSL tự bật khi địa chỉ là Supabase. Muốn kiểm chứng chỉ chặt hơn: tải *SSL certificate* ở Project Settings → Database, đặt `DATABASE_SSL=verify` và `DATABASE_CA_FILE=/đường/dẫn/prod-ca-2021.crt`.
4. Chạy: `docker compose -f docker-compose.supabase.yml up -d --build` (hoặc PM2 như Cách 2, bỏ phần cài PostgreSQL).
   Lần đầu khởi động tự tạo bảng + tài khoản quản trị trong Supabase (xem ở Table Editor).

Lưu ý: dự án Supabase gói miễn phí bị **tạm dừng** khi không có truy cập trong một thời gian – vào trang Supabase bấm *Restore* để chạy lại. Sao lưu: `pg_dump "<DATABASE_URL>" | gzip > backup.sql.gz` hoặc dùng tính năng sao lưu của Supabase.

## Bảo mật đã có sẵn

- Mật khẩu băm bcrypt; phiên đăng nhập là cookie `httpOnly`, `Secure`, `SameSite=Lax`, database chỉ lưu mã băm SHA-256 của phiên.
- Nhập sai mật khẩu 5 lần → khoá tạm 15 phút; giới hạn số lần đăng nhập và gửi form tư vấn theo IP; ô bẫy chống bot spam form.
- Chống CSRF (header riêng + kiểm tra Origin); phân quyền theo vai trò ở máy chủ (quản trị viên, quản lý, kinh doanh, biên tập).
- Mọi thao tác thêm / sửa / xoá / đăng nhập được ghi **Nhật ký**.
- Trang quản trị, xem thử có `noindex`; `robots.txt` chặn `/admin`, `/api`.

## Bản trên Vercel

Vercel vẫn chạy được bản tĩnh (các trang dựng sẵn khi build), **không có** API, database và trang quản trị. Khi chạy trên VPS, website đọc nội dung trực tiếp từ database nên mọi chỉnh sửa trong `/admin` (giá, ẩn/hiện mẫu, hỏi đáp, hotline, SEO) hiện ngay.

## Kiểm thử trước khi đưa lên

```bash
npm run build
npm test            # 100+ test máy chủ: database, đăng nhập, phân quyền, nghiệp vụ, SSR/SEO
npm run test:e2e    # kiểm thử bằng Chrome thật: form tư vấn → quản trị → website
```

Cần một PostgreSQL để test (mặc định `postgres://postgres@localhost:55432/chungauto_test`, đổi bằng biến `TEST_DATABASE_URL`). Database test bị **xoá sạch** mỗi lần chạy – không trỏ vào database thật.
