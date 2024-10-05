/*
  Warnings:

  - You are about to drop the column `passwordSalt` on the `user_credentials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_credentials" DROP COLUMN "passwordSalt";
