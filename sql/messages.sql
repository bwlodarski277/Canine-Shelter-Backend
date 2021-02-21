CREATE TABLE `messages` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `userId` int,
    `staffId` int,
    `dateCreated` datetime DEFAULT CURRENT_TIMESTAMP,
    `message` text NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    FOREIGN KEY (`staffId`) REFERENCES `staff` (`id`)
);