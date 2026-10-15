ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_merchant_id VARCHAR(191);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS configuration_fingerprint CHAR(64);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_origin VARCHAR(300);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS capture_request_id VARCHAR(36);
