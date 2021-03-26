CREATE TABLE `chatMessages` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `chatId` int NOT NULL,
    `messageId` int NOT NULL,
    FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`),
    FOREIGN KEY (`messageId`) REFERENCES `messages` (`id`),
    UNIQUE (`chatId`, `messageId`)
);