CREATE TABLE `dogs` (
    `id` int PRIMARY KEY,
    `name` varchar(32) NOT NULL,
    `description` text,
    `views` int,
    `age` int,
    `gender` bool,
    `dateCreated` datetime,
    `dateModified` datetime,
    `imageUrl` varchar(2048)
);