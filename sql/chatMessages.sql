CREATE TABLE `chatMessages` (
    `chatId` int NOT NULL,
    `messageId` int NOT NULL,
    FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`),
    FOREIGN KEY (`messageId`) REFERENCES `messages` (`id`),
    PRIMARY KEY (`chatId`, `messageId`)
);