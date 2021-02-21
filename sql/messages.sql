CREATE TABLE `messages` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `sender` boolean NOT NULL, -- 0 for staff, 1 for user.
    `dateCreated` datetime DEFAULT CURRENT_TIMESTAMP,
    `message` text NOT NULL
);