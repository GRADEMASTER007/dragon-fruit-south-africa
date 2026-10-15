CREATE TABLE IF NOT EXISTS request_limits (
  bucket_key CHAR(64) PRIMARY KEY,
  request_count INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  INDEX limits_expiry (expires_at)
);
