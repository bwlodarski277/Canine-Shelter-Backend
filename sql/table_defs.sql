USE `canine_shelter`;

CREATE TABLE `users`
(
    `id`           int PRIMARY KEY AUTO_INCREMENT,
    `username`     varchar(16) UNIQUE NOT NULL,
    `email`        varchar(64) UNIQUE NOT NULL,
    `password`     varchar(32)        NOT NULL,
    `passwordSalt` varchar(16)        NOT NULL,
    `firstName`    varchar(32)        NOT NULL,
    `lastName`     varchar(32)        NOT NULL,
    `dateCreated`  datetime DEFAULT CURRENT_TIMESTAMP,
    `imageUrl`     varchar(256)
);

CREATE TABLE `dogs`
(
    `id`          int PRIMARY KEY AUTO_INCREMENT,
    `name`        varchar(32) NOT NULL,
    `description` text,
    `age`         int,
    `gender`      bool,
    `dateAdded`   datetime DEFAULT CURRENT_TIMESTAMP,
    `imageUrl`    varchar(256)
);

CREATE TABLE `staff`
(
    `userId`     int,
    `locationId` int,
    PRIMARY KEY (`userId`, `locationId`)
);

CREATE TABLE `locations`
(
    `id`      int PRIMARY KEY AUTO_INCREMENT,
    `name`    varchar(64) NOT NULL,
    `address` text
);

CREATE TABLE `dogLocations`
(
    `dogId`      int,
    `locationId` int,
    PRIMARY KEY (`dogId`, `locationId`)
);

CREATE TABLE `breeds`
(
    `id`          int PRIMARY KEY,
    `name`        varchar(255) NOT NULL,
    `description` text
);

CREATE TABLE `dogBreeds`
(
    `dogId`   int,
    `breedId` int,
    PRIMARY KEY (`dogId`, `breedId`)
);

CREATE TABLE `favourites`
(
    `userId` int,
    `dogId`  int,
    PRIMARY KEY (`userId`, `dogId`)
);

ALTER TABLE `staff`
    ADD FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

ALTER TABLE `staff`
    ADD FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`);

ALTER TABLE `dogLocations`
    ADD FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`);

ALTER TABLE `dogLocations`
    ADD FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`);

ALTER TABLE `dogBreeds`
    ADD FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`);

ALTER TABLE `dogBreeds`
    ADD FOREIGN KEY (`breedId`) REFERENCES `breeds` (`id`);

ALTER TABLE `favourites`
    ADD FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

ALTER TABLE `favourites`
    ADD FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`);

