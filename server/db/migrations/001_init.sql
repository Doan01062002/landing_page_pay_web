-- ============================================================================
-- ChungAuto – cơ sở dữ liệu trang quản trị (PostgreSQL ≥ 13)
-- Quy ước: bảng & cột snake_case; mã chứng từ tự sinh bằng sequence (TV00001…);
-- tiền tệ lưu bigint (đồng, không có phần lẻ); thời điểm lưu timestamptz.
-- ============================================================================

-- Mã chứng từ: tiền tố + số thứ tự đệm 0 (KH0001); vượt độ rộng thì giữ đủ chữ số (KH12345), không cắt cụt
CREATE FUNCTION ca_code(prefix text, seq regclass, width int) RETURNS text
LANGUAGE sql VOLATILE AS $$
  SELECT prefix || CASE WHEN length(n::text) >= width THEN n::text ELSE lpad(n::text, width, '0') END
  FROM (SELECT nextval(seq) AS n) s
$$;

-- ---------- Tài khoản quản trị ----------
CREATE TABLE users (
  id              serial PRIMARY KEY,
  email           text NOT NULL,
  name            text NOT NULL,
  password_hash   text NOT NULL,
  role            text NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'manager', 'sales', 'editor')),
  active          boolean NOT NULL DEFAULT true,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_key ON users (lower(email));

-- Phiên đăng nhập: chỉ lưu SHA-256 của token (token gốc nằm trong cookie httpOnly)
CREATE TABLE sessions (
  token_hash  text PRIMARY KEY,
  user_id     integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  ip          text,
  user_agent  text
);
CREATE INDEX sessions_user_idx ON sessions (user_id);
CREATE INDEX sessions_expires_idx ON sessions (expires_at);

-- ---------- Cấu hình website (thông tin thương hiệu, khuyến mãi, SEO mặc định) ----------
CREATE TABLE settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  integer REFERENCES users (id) ON DELETE SET NULL
);

-- ---------- Kho mẫu: thông tin kinh doanh của từng mẫu ----------
-- Giao diện (bộ màu, nội dung trang mẫu) nằm trong mã nguồn; bảng này giữ phần quản trị sửa được:
-- tên, giá, mô tả ngắn, hiển thị, thứ tự, nhãn "Mới".
CREATE TABLE catalog_items (
  id          serial PRIMARY KEY,
  kind        text NOT NULL CHECK (kind IN ('template', 'project')),
  slug        text NOT NULL,
  name        text NOT NULL,
  category    text NOT NULL DEFAULT '',
  price       bigint CHECK (price IS NULL OR price >= 0),
  free        boolean NOT NULL DEFAULT false,
  is_new      boolean NOT NULL DEFAULT false,
  featured    boolean NOT NULL DEFAULT false,
  visible     boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  popularity  integer NOT NULL DEFAULT 0,
  summary     text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, slug)
);

-- ---------- Hỏi đáp trên trang chủ ----------
CREATE TABLE faqs (
  id          serial PRIMARY KEY,
  question    text NOT NULL,
  answer      text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  visible     boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- Khách hàng (doanh nghiệp mua phần mềm) ----------
CREATE SEQUENCE customers_code_seq;
CREATE TABLE customers (
  id             serial PRIMARY KEY,
  code           text NOT NULL UNIQUE DEFAULT ca_code('KH', 'customers_code_seq', 4),
  name           text NOT NULL,
  business_name  text NOT NULL DEFAULT '',
  business_type  text NOT NULL DEFAULT '',
  phone          text NOT NULL,
  email          text NOT NULL DEFAULT '',
  address        text NOT NULL DEFAULT '',
  tax_code       text NOT NULL DEFAULT '',
  branches       text NOT NULL DEFAULT '',
  source         text NOT NULL DEFAULT 'Website',
  note           text NOT NULL DEFAULT '',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customers_phone_idx ON customers (phone);

-- ---------- Yêu cầu tư vấn (form trên website) ----------
CREATE SEQUENCE leads_code_seq;
CREATE TABLE leads (
  id             serial PRIMARY KEY,
  code           text NOT NULL UNIQUE DEFAULT ca_code('TV', 'leads_code_seq', 5),
  name           text NOT NULL,
  phone          text NOT NULL,
  email          text NOT NULL DEFAULT '',
  business_type  text NOT NULL DEFAULT '',
  branches       text NOT NULL DEFAULT '',
  interest       text NOT NULL DEFAULT '',
  message        text NOT NULL DEFAULT '',
  source         text NOT NULL DEFAULT 'Website',
  page           text NOT NULL DEFAULT '',
  utm            jsonb NOT NULL DEFAULT '{}',
  status         text NOT NULL DEFAULT 'Mới'
                 CHECK (status IN ('Mới', 'Đã liên hệ', 'Hẹn demo', 'Đã báo giá', 'Chốt hợp đồng', 'Thất bại')),
  assigned_to    integer REFERENCES users (id) ON DELETE SET NULL,
  customer_id    integer REFERENCES customers (id) ON DELETE SET NULL,
  next_follow    date,
  note           text NOT NULL DEFAULT '',
  ip             text,
  user_agent     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_status_idx ON leads (status);
CREATE INDEX leads_created_idx ON leads (created_at DESC);
CREATE INDEX leads_phone_idx ON leads (phone);

-- ---------- Hợp đồng triển khai ----------
CREATE SEQUENCE orders_code_seq;
CREATE TABLE orders (
  id            serial PRIMARY KEY,
  code          text NOT NULL UNIQUE DEFAULT ca_code('HD', 'orders_code_seq', 4),
  customer_id   integer NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  lead_id       integer REFERENCES leads (id) ON DELETE SET NULL,
  item_kind     text NOT NULL DEFAULT 'template' CHECK (item_kind IN ('template', 'project', 'landing', 'custom')),
  item_slug     text NOT NULL DEFAULT '',
  item_name     text NOT NULL,
  package       text NOT NULL DEFAULT '',
  price         bigint NOT NULL CHECK (price >= 0),
  discount      bigint NOT NULL DEFAULT 0 CHECK (discount >= 0),
  gift_landing  boolean NOT NULL DEFAULT true,
  status        text NOT NULL DEFAULT 'Báo giá'
                CHECK (status IN ('Báo giá', 'Đã ký', 'Đang triển khai', 'Chờ nghiệm thu', 'Hoàn tất', 'Đã huỷ')),
  domain        text NOT NULL DEFAULT '',
  start_date    date,
  due_date      date,
  assigned_to   integer REFERENCES users (id) ON DELETE SET NULL,
  note          text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (discount <= price),
  CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)
);
CREATE INDEX orders_customer_idx ON orders (customer_id);
CREATE INDEX orders_status_idx ON orders (status);

-- ---------- Thu tiền (nhiều lần cho một hợp đồng) ----------
CREATE SEQUENCE payments_code_seq;
CREATE TABLE payments (
  id          serial PRIMARY KEY,
  code        text NOT NULL UNIQUE DEFAULT ca_code('PT', 'payments_code_seq', 5),
  order_id    integer NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  amount      bigint NOT NULL CHECK (amount > 0),
  method      text NOT NULL DEFAULT 'Chuyển khoản' CHECK (method IN ('Chuyển khoản', 'Tiền mặt', 'Thẻ', 'Khác')),
  paid_at     date NOT NULL DEFAULT CURRENT_DATE,
  note        text NOT NULL DEFAULT '',
  created_by  integer REFERENCES users (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON payments (order_id);

-- ---------- Nhật ký thao tác ----------
CREATE TABLE audit_logs (
  id          bigserial PRIMARY KEY,
  user_id     integer REFERENCES users (id) ON DELETE SET NULL,
  user_name   text NOT NULL DEFAULT '',
  action      text NOT NULL,
  entity      text NOT NULL,
  entity_id   text,
  summary     text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_created_idx ON audit_logs (created_at DESC);

-- Tổng tiền đã thu & còn lại của hợp đồng
CREATE VIEW order_totals AS
SELECT o.id AS order_id,
       (o.price - o.discount) AS total,
       COALESCE(SUM(p.amount), 0)::bigint AS paid
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
GROUP BY o.id;
