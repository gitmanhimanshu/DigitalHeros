import prisma from '../prisma';

export const MIN_CHARITY_PERCENT = 10.0;
export const MAX_CHARITY_PERCENT = 100.0;

export async function validateCharityPercent(percent: number): Promise<void> {
  if (typeof percent !== 'number' || isNaN(percent)) {
    throw new Error('INVALID_CHARITY_PERCENT: Percentage must be a valid number.');
  }
  if (percent < MIN_CHARITY_PERCENT) {
    throw new Error(
      `INVALID_CHARITY_PERCENT: Minimum charity contribution is ${MIN_CHARITY_PERCENT}% of the subscription fee.`
    );
  }
  if (percent > MAX_CHARITY_PERCENT) {
    throw new Error(
      `INVALID_CHARITY_PERCENT: Charity contribution cannot exceed ${MAX_CHARITY_PERCENT}%.`
    );
  }
}

/**
 * Record a direct independent donation to a charity.
 */
export async function createDirectDonation(params: {
  charityId: string;
  amount: number;
  userId?: string;
  donorName?: string;
  donorEmail?: string;
  stripePaymentId?: string;
}) {
  if (params.amount <= 0) {
    throw new Error('INVALID_AMOUNT: Donation amount must be greater than $0.');
  }

  return prisma.$transaction(async (tx) => {
    const charity = await tx.charity.findUnique({
      where: { id: params.charityId },
    });

    if (!charity) {
      throw new Error('NOT_FOUND: Charity not found.');
    }

    const donation = await tx.charityDonation.create({
      data: {
        charityId: params.charityId,
        userId: params.userId || null,
        amount: params.amount,
        type: 'DIRECT_DONATION',
        donorName: params.donorName || null,
        donorEmail: params.donorEmail || null,
        stripePaymentId: params.stripePaymentId || null,
      },
    });

    // Update charity total raised
    await tx.charity.update({
      where: { id: params.charityId },
      data: {
        totalRaised: { increment: params.amount },
        activeSupporters: params.userId ? { increment: 1 } : undefined,
      },
    });

    return donation;
  });
}

/**
 * Updates a subscriber's selected charity and contribution percentage.
 */
export async function updateSubscriberCharity(
  userId: string,
  charityId: string,
  charityPercent: number
) {
  await validateCharityPercent(charityPercent);

  const charity = await prisma.charity.findUnique({
    where: { id: charityId },
  });

  if (!charity || !charity.active) {
    throw new Error('NOT_FOUND: Selected charity is inactive or does not exist.');
  }

  return prisma.subscription.update({
    where: { userId },
    data: {
      charityId,
      charityPercent,
    },
    include: {
      charity: true,
    },
  });
}

