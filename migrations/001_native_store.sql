CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  open_id VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL DEFAULT '',
  email VARCHAR(320) NOT NULL DEFAULT '',
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS products (
  sku VARCHAR(100) PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price_cents BIGINT NOT NULL,
  stock INT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX products_category_active (category, active),
  CHECK (price_cents >= 0),
  CHECK (stock >= 0)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX contact_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id VARCHAR(36) PRIMARY KEY,
  reference VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(60),
  company VARCHAR(200),
  address_line1 VARCHAR(300) NOT NULL,
  address_line2 VARCHAR(300),
  city VARCHAR(120) NOT NULL,
  province VARCHAR(120),
  postal_code VARCHAR(30),
  country VARCHAR(120) NOT NULL,
  shipping_method VARCHAR(30) NOT NULL,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX quotes_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS quote_items (
  id VARCHAR(36) PRIMARY KEY,
  quote_id VARCHAR(36) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(300) NOT NULL,
  quantity INT NOT NULL,
  unit_price_cents BIGINT NOT NULL,
  UNIQUE KEY quote_sku (quote_id, sku),
  FOREIGN KEY (quote_id) REFERENCES quote_requests(id),
  FOREIGN KEY (sku) REFERENCES products(sku),
  CHECK (quantity > 0),
  CHECK (unit_price_cents >= 0)
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  reference VARCHAR(64) NOT NULL UNIQUE,
  user_id VARCHAR(36),
  access_token_hash CHAR(64) NOT NULL,
  idempotency_key VARCHAR(100) NOT NULL UNIQUE,
  request_hash CHAR(64) NOT NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  address VARCHAR(300),
  city VARCHAR(120),
  country VARCHAR(120) NOT NULL,
  notes TEXT,
  shipping_method VARCHAR(30) NOT NULL,
  shipping_cents BIGINT NOT NULL,
  subtotal_cents BIGINT NOT NULL,
  total_cents BIGINT NOT NULL,
  paid_cents BIGINT NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'ZAR',
  environment VARCHAR(10) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX orders_user_created (user_id, created_at),
  INDEX orders_status_created (status, created_at),
  CHECK (total_cents >= 0),
  CHECK (paid_cents >= 0)
);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(300) NOT NULL,
  quantity INT NOT NULL,
  unit_price_cents BIGINT NOT NULL,
  UNIQUE KEY order_sku (order_id, sku),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (sku) REFERENCES products(sku),
  CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS gateway_settings (
  gateway VARCHAR(20) PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mode VARCHAR(10) NOT NULL DEFAULT 'test',
  validated_at TIMESTAMP(3),
  validation_status VARCHAR(30) NOT NULL DEFAULT 'not_configured',
  configuration_fingerprint CHAR(64),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  gateway VARCHAR(20) NOT NULL,
  environment VARCHAR(10) NOT NULL,
  provider_reference VARCHAR(191),
  provider_capture_reference VARCHAR(191),
  amount_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'initiated',
  refund_status VARCHAR(30) NOT NULL DEFAULT 'none',
  verified_at TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY payment_provider_reference (gateway, environment, provider_reference),
  UNIQUE KEY payment_provider_capture (gateway, environment, provider_capture_reference),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX payments_order (order_id),
  INDEX payments_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id VARCHAR(36) PRIMARY KEY,
  gateway VARCHAR(20) NOT NULL,
  environment VARCHAR(10) NOT NULL,
  provider_event_id VARCHAR(191) NOT NULL,
  payment_id VARCHAR(36),
  event_type VARCHAR(100) NOT NULL,
  processing_result VARCHAR(100) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY webhook_deduplication (gateway, environment, provider_event_id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE TABLE IF NOT EXISTS store_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  value_json JSON NOT NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS persistence_probes (
  id VARCHAR(36) PRIMARY KEY,
  description VARCHAR(300) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);
