CREATE TABLE `messages` (
    `userId` int,
    `staffId` int,
    `dateCreated` datetime,
    `message` text NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    FOREIGN KEY (`staffId`) REFERENCES `staff` (`id`),
    PRIMARY KEY (`userId`, `staffId`)
);