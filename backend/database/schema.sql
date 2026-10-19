-- ==============================================================
-- DATABASE SCHEMA: WEDDING PLANNER (MULTI-TENANT)
-- Dialect: MySQL 8.0+ / MariaDB
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `wedding_planner` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `wedding_planner`;

-- 1. Tabel Profil Pernikahan
CREATE TABLE IF NOT EXISTS `wedding_profiles` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `bride_name` VARCHAR(255) DEFAULT '',
    `groom_name` VARCHAR(255) DEFAULT '',
    `wedding_date` VARCHAR(50) DEFAULT '',
    `location` VARCHAR(255) DEFAULT '',
    `total_budget` DOUBLE DEFAULT 0,
    `target_savings` DOUBLE DEFAULT 0,
    `notes` TEXT,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_profiles_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Tabungan Pernikahan
CREATE TABLE IF NOT EXISTS `savings_records` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `month_number` INT DEFAULT 1,
    `month_year` VARCHAR(100) NOT NULL,
    `target_amount` DOUBLE DEFAULT 0,
    `groom_saved` DOUBLE DEFAULT 0,
    `bride_saved` DOUBLE DEFAULT 0,
    `total_saved` DOUBLE DEFAULT 0,
    `status` VARCHAR(50) DEFAULT 'Belum',
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_savings_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Anggaran & Pengeluaran
CREATE TABLE IF NOT EXISTS `budget_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `category` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `estimated_cost` DOUBLE DEFAULT 0,
    `actual_cost` DOUBLE DEFAULT 0,
    `paid_amount` DOUBLE DEFAULT 0,
    `remaining` DOUBLE DEFAULT 0,
    `status` VARCHAR(50) DEFAULT 'Belum Bayar',
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_budget_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Checklist Persiapan
CREATE TABLE IF NOT EXISTS `checklist_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `phase` VARCHAR(100) NOT NULL,
    `task` VARCHAR(255) NOT NULL,
    `pic` VARCHAR(100) DEFAULT '',
    `is_completed` TINYINT(1) DEFAULT 0,
    `due_date` VARCHAR(50) DEFAULT '',
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_checklist_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Susunan Acara (Rundown Hari-H)
CREATE TABLE IF NOT EXISTS `rundown_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `time` VARCHAR(50) NOT NULL,
    `activity` VARCHAR(255) NOT NULL,
    `pic` VARCHAR(100) DEFAULT '',
    `location` VARCHAR(150) DEFAULT '',
    `notes` TEXT,
    `order_index` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_rundown_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Daftar Tamu Undangan
CREATE TABLE IF NOT EXISTS `guests` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) DEFAULT 'Pihak Pria',
    `phone` VARCHAR(50) DEFAULT '',
    `pax` INT DEFAULT 1,
    `rsvp_status` VARCHAR(50) DEFAULT 'Belum Konfirmasi',
    `table_number` VARCHAR(50) DEFAULT '',
    `souvenir_given` TINYINT(1) DEFAULT 0,
    `gift_amount` DOUBLE DEFAULT 0,
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_guests_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Vendor Pernikahan
CREATE TABLE IF NOT EXISTS `vendors` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `category` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `contact` VARCHAR(100) DEFAULT '',
    `deal_price` DOUBLE DEFAULT 0,
    `paid_amount` DOUBLE DEFAULT 0,
    `remaining` DOUBLE DEFAULT 0,
    `status` VARCHAR(50) DEFAULT 'Belum Booking',
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_vendors_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Tabel Denah Meja Tamu
CREATE TABLE IF NOT EXISTS `seating_tables` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `table_number` VARCHAR(50) NOT NULL,
    `table_name` VARCHAR(150) DEFAULT '',
    `capacity` INT DEFAULT 8,
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_tables_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Tabel Pendamping Pengantin & Panitia
CREATE TABLE IF NOT EXISTS `bridal_party_members` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `role` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) DEFAULT '',
    `main_task` TEXT,
    `outfit_size` VARCHAR(20) DEFAULT '',
    `notes` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_party_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Tabel Pengguna (Auth & Akun Pengguna)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) DEFAULT 'pengantin',
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
