import prisma from '../prisma';

export interface ProofUploadInput {
  verificationId: string;
  userId: string;
  proofImageUrl: string;
}

/**
 * Uploads/attaches proof of golf scores for a winning subscriber.
 */
export async function submitWinnerProof(input: ProofUploadInput) {
  const verification = await prisma.winnerVerification.findFirst({
    where: {
      id: input.verificationId,
      userId: input.userId,
    },
  });

  if (!verification) {
    throw new Error('NOT_FOUND: Verification record not found or not owned by user.');
  }

  if (verification.payoutStatus === 'PAID') {
    throw new Error('INVALID_STATE: This prize payout has already been completed.');
  }

  return prisma.winnerVerification.update({
    where: { id: input.verificationId },
    data: {
      proofImageUrl: input.proofImageUrl,
      status: 'PENDING', // set to pending review
    },
    include: {
      draw: true,
    },
  });
}

/**
 * Administrator reviews proof: Approves or Rejects.
 */
export async function reviewWinnerProof(
  verificationId: string,
  adminId: string,
  action: 'APPROVE' | 'REJECT',
  adminNotes?: string
) {
  const verification = await prisma.winnerVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('NOT_FOUND: Verification record not found.');
  }

  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  return prisma.winnerVerification.update({
    where: { id: verificationId },
    data: {
      status: newStatus,
      adminNotes: adminNotes || null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      draw: true,
    },
  });
}

/**
 * Updates the payout state from PENDING to PAID.
 * Idempotent: safe to run.
 */
export async function markPayoutAsPaid(verificationId: string, adminId: string) {
  const verification = await prisma.winnerVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('NOT_FOUND: Verification record not found.');
  }

  if (verification.status !== 'APPROVED') {
    throw new Error(
      'INVALID_STATE: Proof must be APPROVED before payout can be marked as PAID.'
    );
  }

  return prisma.winnerVerification.update({
    where: { id: verificationId },
    data: {
      payoutStatus: 'PAID',
      paidAt: new Date(),
      reviewedBy: adminId,
    },
    include: {
      user: true,
      draw: true,
    },
  });
}

