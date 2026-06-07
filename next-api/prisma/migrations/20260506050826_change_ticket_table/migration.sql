/*
  Warnings:

  - A unique constraint covering the columns `[TicketNumber]` on the table `ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `TicketNumber` to the `ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `ProductNumber` VARCHAR(100) NULL,
    ADD COLUMN `ReferenceNumber` VARCHAR(100) NULL,
    ADD COLUMN `SerialNumber` VARCHAR(100) NULL,
    ADD COLUMN `TicketNumber` VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ticket_TicketNumber_key` ON `ticket`(`TicketNumber`);
