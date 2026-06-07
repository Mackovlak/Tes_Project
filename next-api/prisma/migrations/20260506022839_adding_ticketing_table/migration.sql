-- CreateTable
CREATE TABLE `ticket` (
    `TicketID` INTEGER NOT NULL AUTO_INCREMENT,
    `ContactID` INTEGER NULL,
    `SiteAccountID` INTEGER NULL,
    `Type` ENUM('PERBAIKAN', 'PENGAMBILAN_BARANG', 'ONLINE_BOOKING', 'PREMIUM') NOT NULL,
    `Status` ENUM('OPEN', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'READY_FOR_PICKUP', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `Subject` VARCHAR(255) NOT NULL,
    `Description` TEXT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UpdatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`TicketID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_history` (
    `HistoryID` INTEGER NOT NULL AUTO_INCREMENT,
    `TicketID` INTEGER NOT NULL,
    `ChangedBy` VARCHAR(100) NULL,
    `OldStatus` VARCHAR(50) NULL,
    `NewStatus` VARCHAR(50) NOT NULL,
    `Note` TEXT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`HistoryID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_ContactID_fkey` FOREIGN KEY (`ContactID`) REFERENCES `contact_information`(`ContactID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_SiteAccountID_fkey` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account`(`SiteAccountID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_history` ADD CONSTRAINT `ticket_history_TicketID_fkey` FOREIGN KEY (`TicketID`) REFERENCES `ticket`(`TicketID`) ON DELETE CASCADE ON UPDATE CASCADE;
