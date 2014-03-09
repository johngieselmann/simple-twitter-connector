/* CREATE THE TABLE TO STORE THE FEEDS */
CREATE TABLE IF NOT EXISTS tweets (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `tweets` LONGTEXT DEFAULT NULL,
    `created` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
