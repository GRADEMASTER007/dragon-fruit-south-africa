CREATE TABLE IF NOT EXISTS guest_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX guest_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS cart_items (
  session_hash CHAR(64) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (session_hash, sku),
  FOREIGN KEY (session_hash) REFERENCES guest_sessions(token_hash),
  FOREIGN KEY (sku) REFERENCES products(sku),
  CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  slug VARCHAR(191) PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  excerpt TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  publication_date DATE NOT NULL,
  read_time VARCHAR(40) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  image_alt VARCHAR(500) NOT NULL,
  sections_json JSON NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
