CREATE TABLE `users` (
    `id` int PRIMARY KEY,
    `username` varchar(32) UNIQUE NOT NULL,
    `email` varchar(32) UNIQUE NOT NULL,
    `password` varchar(256) NOT NULL,
    `passwordSalt` varchar(256) NOT NULL,
    `firstName` varchar(32) NOT NULL,
    `lastName` varchar(32) NOT NULL,
    `dateCreated` datetime,
    `dateModified` datetime,
    `imageUrl` varchar(2048)
);