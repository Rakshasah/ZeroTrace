-- ZeroTrace Database Initialization Script
-- Use this if you are NOT using Docker or Prisma migrations.
-- Import this into your MySQL database (e.g. via phpMyAdmin or Workbench).

CREATE DATABASE IF NOT EXISTS zerotrace;
USE zerotrace;

-- Users Table
-- Stores user credentials and public identity keys for encryption.
CREATE TABLE IF NOT EXISTS User (
    id VARCHAR(36) NOT NULL,
    username VARCHAR(191) NOT NULL,
    passwordHash VARCHAR(191) NOT NULL,
    publicKey TEXT NOT NULL,
    lastSeen DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (id),
    UNIQUE INDEX User_username_key(username)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Messages Table
-- Stores encrypted message blobs. Server CANNOT decrypt these.
CREATE TABLE IF NOT EXISTS Message (
    id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    iv VARCHAR(191) NOT NULL, -- Required for AES-GCM
    senderId VARCHAR(36) NOT NULL,
    receiverId VARCHAR(36) NOT NULL,
    expiresAt DATETIME(3) NULL, -- Optional: when the message should be deleted
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (id),
    INDEX Message_senderId_idx(senderId),
    INDEX Message_receiverId_idx(receiverId),
    
    FOREIGN KEY (senderId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Success Message (visible if running in CLI)
SELECT 'Database structure created successfully!' as status;
