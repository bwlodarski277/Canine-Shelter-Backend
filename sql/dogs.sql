CREATE TABLE `dogs` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name` varchar(32) NOT NULL,
    `description` text,
    `age` int UNSIGNED,
    `gender` bool,
    `dateCreated` datetime DEFAULT CURRENT_TIMESTAMP,
    `dateModified` datetime ON UPDATE CURRENT_TIMESTAMP,
    `imageUrl` varchar(2048)
);