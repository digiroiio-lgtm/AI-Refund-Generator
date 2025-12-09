-- CreateTable User
CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");

-- CreateTable Scan
CREATE TABLE "Scan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "flightNumber" TEXT NOT NULL,
  "flightDate" TEXT NOT NULL,
  "eligible" INTEGER NOT NULL,
  "compensationAmount" INTEGER NOT NULL,
  "regulation" TEXT NOT NULL,
  "confidence" INTEGER NOT NULL,
  "delayMinutes" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable Purchase
CREATE TABLE "Purchase" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "scanId" TEXT NOT NULL,
  "stripeSessionId" TEXT NOT NULL,
  "stripeCustomerEmail" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','paid')),
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Purchase_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Purchase_stripeSessionId_key" ON "Purchase" ("stripeSessionId");

-- CreateTable ClaimLetter
CREATE TABLE "ClaimLetter" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "scanId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClaimLetter_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ClaimLetter_scanId_key" ON "ClaimLetter" ("scanId");
