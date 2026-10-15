CREATE TABLE IF NOT EXISTS oauth_nonces (
  nonce_hash CHAR(64) PRIMARY KEY,
  redirect_uri VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP(3),
  INDEX oauth_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS guest_preferences (
  session_hash CHAR(64) PRIMARY KEY,
  notice_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (session_hash) REFERENCES guest_sessions(token_hash)
);
