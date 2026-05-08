
CREATE TABLE IF NOT EXISTS posts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(500) NOT NULL,
  image_url    TEXT,
  images       JSON         NOT NULL,
  caption      TEXT,
  tags         JSON         NOT NULL,
  created_at   TIMESTAMP    NOT NULL,
  updated_at   TIMESTAMP    NOT NULL,
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS posts_v2 (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  legacy_post_id INT NULL UNIQUE,
  title          VARCHAR(500) NOT NULL,
  content        JSON NOT NULL,
  assets         JSON NOT NULL,
  tags           JSON NOT NULL,
  created_at     TIMESTAMP NOT NULL,
  updated_at     TIMESTAMP NOT NULL,
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_admin      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
