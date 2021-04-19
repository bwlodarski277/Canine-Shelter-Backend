CREATE TABLE `breeds` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name` varchar(64) NOT NULL,
    `description` text
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
);