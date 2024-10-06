/*
  Warnings:

  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users"
ADD COLUMN     "firstName" VARCHAR(255),
ADD COLUMN     "lastName" VARCHAR(100);

UPDATE "users"
SET "firstName" = "first_name",
    "lastName" = "last_name";


ALTER TABLE "users"
ALTER COLUMN "firstName" SET NOT NULL;

ALTER TABLE "users"
DROP COLUMN "last_name",
DROP COLUMN "first_name";
