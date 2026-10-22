CREATE DATABASE IF NOT EXISTS bible_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bible_app;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reference VARCHAR(100) NOT NULL,
  translation VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY one_per_user (user_id, reference, translation),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bible text you load yourself (for example the Waray-Waray version, translation = "waray")
CREATE TABLE IF NOT EXISTS verses (
  translation VARCHAR(20) NOT NULL,
  book_nr TINYINT UNSIGNED NOT NULL,
  chapter SMALLINT UNSIGNED NOT NULL,
  verse SMALLINT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (translation, book_nr, chapter, verse)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;