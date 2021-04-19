CREATE TABLE `users` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `role` varchar(32) NOT NULL,
    `provider` varchar(32) DEFAULT 'local',
    `username` varchar(32) UNIQUE NOT NULL,
    `email` varchar(32) UNIQUE NOT NULL,
    `password` varchar(256),
    `firstName` varchar(32) NOT NULL,
    `lastName` varchar(32) NOT NULL,
    `dateCreated` datetime DEFAULT CURRENT_TIMESTAMP,
    `dateModified` datetime ON UPDATE CURRENT_TIMESTAMP,
    `imageUrl` varchar(2048),
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    UNIQUE (`role`, `username`)
);