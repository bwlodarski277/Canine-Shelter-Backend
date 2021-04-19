CREATE TABLE `chatMessages` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `chatId` int NOT NULL,
    `messageId` int NOT NULL,
    FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`messageId`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
    UNIQUE (`chatId`, `messageId`)
);