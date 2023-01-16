import { prisma } from "@/config";
import { Enrollment } from "@prisma/client";
import { Address } from "@prisma/client";

async function findWithAddressByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

async function findById(enrollmentId: number) {
  return prisma.enrollment.findFirst({
    where: { id: enrollmentId }
  });
}

async function doEnrollmentTransactions(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
  createdAddress: CreateAddressParams, 
  updatedAddress: UpdateAddressParams
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.upsert({
        where: {
          userId,
        },
        create: createdEnrollment,
        update: updatedEnrollment,
      });
      const enrollmentId = enrollment.id;

      const address = await tx.address.upsert({
        where: {
          enrollmentId,
        },
        create: {
          ...createdAddress,
          Enrollment: { connect: { id: enrollmentId } },
        },
        update: updatedAddress,
      });
    });
  }
    
  catch (error) {
    throw new Error("erro ao criar enrollment");
  }
}

export type CreateEnrollmentParams = Omit<Enrollment, "id" | "createdAt" | "updatedAt">;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, "userId">;

export type CreateAddressParams = Omit<Address, "id" | "createdAt" | "updatedAt" | "enrollmentId">;
export type UpdateAddressParams = CreateAddressParams;

const enrollmentRepository = {
  findWithAddressByUserId,
  findById,
  doEnrollmentTransactions
};

export default enrollmentRepository;
