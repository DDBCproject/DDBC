DROP DATABASE IF EXISTS `messages_from_the_mines`;

CREATE DATABASE `messages_from_the_mines`;

ALTER DATABASE `messages_from_the_mines` 
CHARACTER SET utf8 COLLATE utf8_general_ci;

USE `messages_from_the_mines`;

-- original tables, these hold all messages

DROP TABLE IF EXISTS `coinbase_messages`;
CREATE TABLE `coinbase_messages` (
  `block_height` int NOT NULL,
  `block_hash` char(64) NOT NULL,
  `block_timestamp` datetime NOT NULL,
  `transaction_hash` char(64) NOT NULL,
  `script_op_index` int NOT NULL,
  `data` text NOT NULL,
  `valid` tinyint(4) DEFAULT 0,
  `tags` text DEFAULT NULL,
  `bookmarked` tinyint(4) DEFAULT 0,
  `reviewed` tinyint(4) DEFAULT 0,
  `annotation` mediumtext DEFAULT NULL,
  `nsfw` tinyint(4) DEFAULT 0,
  `data_hash` char(32) DEFAULT NULL,
  `id` int AUTO_INCREMENT,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `address_messages`;
CREATE TABLE `address_messages` (
  `block_height` int NOT NULL,
  `block_hash` char(64) NOT NULL,
  `block_timestamp` datetime NOT NULL,
  `transaction_index` int NOT NULL,
  `transaction_hash` char(64) NOT NULL,
  `data` mediumtext NOT NULL,
  `valid` tinyint(4) DEFAULT 0,
  `tags` text DEFAULT NULL,
  `bookmarked` tinyint(4) DEFAULT 0,
  `reviewed` tinyint(4) DEFAULT 0,
  `annotation` mediumtext,
  `format` tinyint(4) DEFAULT 0,
  `nsfw` tinyint(4) DEFAULT 0,
  `data_hash` char(32) DEFAULT NULL,
  `id` int AUTO_INCREMENT,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `file_address_messages`;
CREATE TABLE `file_address_messages` (
  `block_height` int NOT NULL,
  `block_hash` char(64) NOT NULL,
  `block_timestamp` datetime NOT NULL,
  `transaction_index` int NOT NULL,
  `transaction_hash` char(64) NOT NULL,
  `data` mediumtext NOT NULL,
  `filetype` varchar(255) DEFAULT NULL,
  `valid` tinyint(4) DEFAULT 0,
  `tags` text DEFAULT NULL,
  `bookmarked` tinyint(4) DEFAULT 0,
  `reviewed` tinyint(4) DEFAULT 0,
  `annotation` mediumtext,
  `nsfw` tinyint(4) DEFAULT 0,
  `data_hash` char(32) DEFAULT NULL,
  `id` int AUTO_INCREMENT,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `op_return_address_messages`;
CREATE TABLE `op_return_address_messages` (
  `block_height` int NOT NULL,
  `block_hash` char(64) NOT NULL,
  `block_timestamp` datetime NOT NULL,
  `transaction_index` int NOT NULL,
  `transaction_hash` char(64) NOT NULL,
  `data` mediumtext NOT NULL,
  `valid` tinyint(4) DEFAULT 0,
  `tags` text DEFAULT NULL,
  `bookmarked` tinyint(4) DEFAULT 0,
  `reviewed` tinyint(4) DEFAULT 0,
  `annotation` mediumtext,
  `format` tinyint(4) DEFAULT 0,
  `nsfw` tinyint(4) DEFAULT 0,
  `data_hash` char(32) DEFAULT NULL,
  `id` int AUTO_INCREMENT,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `op_return_file_address_messages`;
CREATE TABLE `op_return_file_address_messages` (
  `block_height` int NOT NULL,
  `block_hash` char(64) NOT NULL,
  `block_timestamp` datetime NOT NULL,
  `transaction_index` int NOT NULL,
  `transaction_hash` char(64) NOT NULL,
  `data` mediumtext NOT NULL,
  `filetype` varchar(255) DEFAULT NULL,
  `valid` tinyint(4) DEFAULT 0,
  `tags` text DEFAULT NULL,
  `bookmarked` tinyint(4) DEFAULT 0,
  `reviewed` tinyint(4) DEFAULT 0,
  `annotation` mediumtext,
  `nsfw` tinyint(4) DEFAULT 0,
  `data_hash` char(32) DEFAULT NULL,
  `id` int AUTO_INCREMENT,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- table indexes

CREATE INDEX `transaction_hash_index` ON `coinbase_messages` (`transaction_hash`);
CREATE INDEX `block_height_index`     ON `coinbase_messages` (`block_height`);
CREATE INDEX `valid_index`            ON `coinbase_messages` (`valid`);
CREATE INDEX `reviewed_index`         ON `coinbase_messages` (`reviewed`);
CREATE INDEX `bookmarked_index`       ON `coinbase_messages` (`bookmarked`);
CREATE INDEX `nsfw_index`             ON `coinbase_messages` (`nsfw`);
CREATE INDEX `data_hash_index`        ON `coinbase_messages` (`data_hash`);
CREATE INDEX `transaction_data_index` ON `coinbase_messages` (`data` (50));

CREATE INDEX `transaction_hash_index` ON `address_messages` (`transaction_hash`);
CREATE INDEX `block_height_index`     ON `address_messages` (`block_height`);
CREATE INDEX `valid_index`            ON `address_messages` (`valid`);
CREATE INDEX `reviewed_index`         ON `address_messages` (`reviewed`);
CREATE INDEX `bookmarked_index`       ON `address_messages` (`bookmarked`);
CREATE INDEX `nsfw_index`             ON `address_messages` (`nsfw`);
CREATE INDEX `data_hash_index`        ON `address_messages` (`data_hash`);
CREATE INDEX `transaction_data_index` ON `address_messages` (`data` (50));

CREATE INDEX `transaction_hash_index` ON `file_address_messages` (`transaction_hash`);
CREATE INDEX `block_height_index`     ON `file_address_messages` (`block_height`);
CREATE INDEX `valid_index`            ON `file_address_messages` (`valid`);
CREATE INDEX `reviewed_index`         ON `file_address_messages` (`reviewed`);
CREATE INDEX `bookmarked_index`       ON `file_address_messages` (`bookmarked`);
CREATE INDEX `nsfw_index`             ON `file_address_messages` (`nsfw`);
CREATE INDEX `data_hash_index`        ON `file_address_messages` (`data_hash`);
CREATE INDEX `transaction_data_index` ON `file_address_messages` (`data` (50));

CREATE INDEX `transaction_hash_index` ON `op_return_address_messages` (`transaction_hash`);
CREATE INDEX `block_height_index`     ON `op_return_address_messages` (`block_height`);
CREATE INDEX `valid_index`            ON `op_return_address_messages` (`valid`);
CREATE INDEX `reviewed_index`         ON `op_return_address_messages` (`reviewed`);
CREATE INDEX `bookmarked_index`       ON `op_return_address_messages` (`bookmarked`);
CREATE INDEX `nsfw_index`             ON `op_return_address_messages` (`nsfw`);
CREATE INDEX `data_hash_index`        ON `op_return_address_messages` (`data_hash`);
CREATE INDEX `transaction_data_index` ON `op_return_address_messages` (`data` (50));

CREATE INDEX `transaction_hash_index` ON `op_return_file_address_messages` (`transaction_hash`);
CREATE INDEX `block_height_index`     ON `op_return_file_address_messages` (`block_height`);
CREATE INDEX `valid_index`            ON `op_return_file_address_messages` (`valid`);
CREATE INDEX `reviewed_index`         ON `op_return_file_address_messages` (`reviewed`);
CREATE INDEX `bookmarked_index`       ON `op_return_file_address_messages` (`bookmarked`);
CREATE INDEX `nsfw_index`             ON `op_return_file_address_messages` (`nsfw`);
CREATE INDEX `data_hash_index`        ON `op_return_file_address_messages` (`data_hash`);
CREATE INDEX `transaction_data_index` ON `op_return_file_address_messages` (`data` (50));

-- create tables for coinbase_messages, address_messages, and 
-- op_return_address_messages that contain only unique messages 
-- by creating primary keys for md5 hashes of their `data` columns

CREATE TABLE `coinbase_messages_unique` LIKE `coinbase_messages`;
CREATE INDEX `id_index` ON `coinbase_messages_unique` (`id`);
ALTER TABLE  `coinbase_messages_unique` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE  `coinbase_messages_unique` DROP PRIMARY KEY; 
ALTER TABLE  `coinbase_messages_unique` ADD PRIMARY KEY(`data_hash`);

CREATE TABLE `address_messages_unique` LIKE `address_messages`;
CREATE INDEX `id_index` ON `address_messages_unique` (`id`);
ALTER TABLE  `address_messages_unique` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE  `address_messages_unique` DROP PRIMARY KEY; 
ALTER TABLE  `address_messages_unique` ADD PRIMARY KEY(`data_hash`);

CREATE TABLE `op_return_address_messages_unique` LIKE `op_return_address_messages`;
CREATE INDEX `id_index` ON `op_return_address_messages_unique` (`id`);
ALTER TABLE  `op_return_address_messages_unique` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE  `op_return_address_messages_unique` DROP PRIMARY KEY; 
ALTER TABLE  `op_return_address_messages_unique` ADD PRIMARY KEY(`data_hash`);
