-- ============================================================================
-- Migration: AI Learning Assistant Chatbot with Gemini & RAG
-- Database: online_learning_db
-- Description: Creates ai_conversations, ai_messages, and ai_knowledge_chunks
--              without destructive cascading deletes on academic records.
-- ============================================================================

USE `online_learning_db`;

-- 1. AI Conversations Table
CREATE TABLE IF NOT EXISTS `ai_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NULL DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT 'Cuộc trò chuyện mới',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ai_conversations_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ai_conversations_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_ai_conv_user_course` (`user_id`, `course_id`),
  INDEX `idx_ai_conv_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. AI Messages Table
CREATE TABLE IF NOT EXISTS `ai_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender` ENUM('USER', 'AI') NOT NULL,
  `content` TEXT NOT NULL,
  `sources` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ai_messages_conversation`
    FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_ai_msg_conv_created` (`conversation_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. AI Knowledge Chunks Table (RAG Vector Store)
CREATE TABLE IF NOT EXISTS `ai_knowledge_chunks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `chunk_index` INT NOT NULL,
  `content` TEXT NOT NULL,
  `content_hash` VARCHAR(64) DEFAULT NULL,
  `embedding` JSON NOT NULL,
  `source_title` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ai_chunks_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ai_chunks_lesson`
    FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY `uq_ai_lesson_chunk` (`lesson_id`, `chunk_index`),
  INDEX `idx_ai_chunks_course` (`course_id`),
  INDEX `idx_ai_chunks_lesson` (`lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

