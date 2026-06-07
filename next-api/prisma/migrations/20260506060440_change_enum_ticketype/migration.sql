/*
  Warnings:

  - The values [PERBAIKAN,PENGAMBILAN_BARANG,ONLINE_BOOKING,PREMIUM] on the enum `ticket_Type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `ticket` MODIFY `Type` ENUM('Perbaikan', 'PengambilanBarang', 'OnlineBooking', 'Premium') NOT NULL;
