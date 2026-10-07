-- Thông báo "đã xem" theo từng tài khoản quản trị: mỗi việc cần xử lý có mã riêng
-- (vd leads:12:new, leads:12:follow:2026-10-15, orders:5:due:2026-10-20). Xem trên máy này thì máy khác cũng hết báo.
CREATE TABLE notification_seen (
  user_id  integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  key      text NOT NULL CHECK (length(key) BETWEEN 1 AND 120),
  seen_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
