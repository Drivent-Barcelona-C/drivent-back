import { prisma } from "@/config";
import { Payment } from "@prisma/client";
import { TicketStatus } from "@prisma/client";

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function paymentTransaction(ticketId: number, params: PaymentParams) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        ticketId,
        ...params,
      },
    });

    await tx.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: TicketStatus.PAID,
      }
    });
    return payment;
  });
}

export type PaymentParams = Omit<Payment, "id" | "createdAt" | "updatedAt">;

const paymentRepository = {
  findPaymentByTicketId,
  paymentTransaction
};

export default paymentRepository;
