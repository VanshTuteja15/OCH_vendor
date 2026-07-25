-- CreateEnum
CREATE TYPE "OwnershipCategory" AS ENUM ('PREFER_NOT_TO_DISCLOSE', 'WOMEN_OWNED', 'INDIGENOUS_OWNED', 'MINORITY_OWNED');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('onsite', 'scheduled', 'pending', 'completed');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'approved', 'paid', 'rejected');

-- CreateEnum
CREATE TYPE "AccessRequestStatus" AS ENUM ('pending', 'approved', 'denied');

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "ownershipCategory" "OwnershipCategory" NOT NULL DEFAULT 'PREFER_NOT_TO_DISCLOSE',
    "diversityNotes" TEXT NOT NULL DEFAULT '',
    "initials" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'EFT (Direct Deposit)',
    "institutionNumber" TEXT NOT NULL DEFAULT '',
    "transitNumber" TEXT NOT NULL DEFAULT '',
    "accountNumber" TEXT NOT NULL DEFAULT '',
    "pendingChangeRequested" BOOLEAN NOT NULL DEFAULT false,
    "pendingChangeRequestedDate" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorUser" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDoc" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploadedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "priority" "WorkOrderPriority" NOT NULL,
    "status" "WorkOrderStatus" NOT NULL,
    "notToExceed" DOUBLE PRECISION NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "amountBeforeTax" DOUBLE PRECISION NOT NULL,
    "hst" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT NOT NULL DEFAULT '',
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceAttachment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT,

    CONSTRAINT "InvoiceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" "AccessRequestStatus" NOT NULL DEFAULT 'pending',
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_email_key" ON "Vendor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VendorUser_clerkUserId_key" ON "VendorUser"("clerkUserId");

-- CreateIndex
CREATE INDEX "VendorUser_vendorId_idx" ON "VendorUser"("vendorId");

-- CreateIndex
CREATE INDEX "ComplianceDoc_vendorId_idx" ON "ComplianceDoc"("vendorId");

-- CreateIndex
CREATE INDEX "WorkOrder_vendorId_idx" ON "WorkOrder"("vendorId");

-- CreateIndex
CREATE INDEX "Invoice_vendorId_idx" ON "Invoice"("vendorId");

-- CreateIndex
CREATE INDEX "Invoice_workOrderId_idx" ON "Invoice"("workOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_vendorId_invoiceNumber_key" ON "Invoice"("vendorId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceAttachment_invoiceId_idx" ON "InvoiceAttachment"("invoiceId");

-- CreateIndex
CREATE INDEX "AccessRequest_vendorId_idx" ON "AccessRequest"("vendorId");

-- AddForeignKey
ALTER TABLE "VendorUser" ADD CONSTRAINT "VendorUser_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDoc" ADD CONSTRAINT "ComplianceDoc_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceAttachment" ADD CONSTRAINT "InvoiceAttachment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
