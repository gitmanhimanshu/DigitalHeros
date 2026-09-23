import prisma from '../prisma';

export const PLANS = {
  MONTHLY: {
    id: 'MONTHLY',
    name: 'Monthly Member',
    price: 29.0,
    interval: 'month',
    discount: null,
    description: 'Billed monthly. Full draw entry and charitable allocation.',
  },
  YEARLY: {
    id: 'YEARLY',
    name: 'Annual Champion',
    price: 290.0, // ~$24.16/mo (2 months free / 17% savings)
    interval: 'year',
    discount: '17% OFF (2 Months Free)',
    description: 'Billed annually. Includes all monthly draws and higher impact.',
  },
} as const;

export async function createOrUpdateSubscription(params: {
  userId: string;
  planType: 'MONTHLY' | 'YEARLY';
  charityId?: string;
  charityPercent?: number;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}) {
  const plan = PLANS[params.planType] || PLANS.MONTHLY;
  const now = new Date();
  const renewal = new Date();
  if (params.planType === 'YEARLY') {
    renewal.setFullYear(now.getFullYear() + 1);
  } else {
    renewal.setMonth(now.getMonth() + 1);
  }

  const charityPercent = params.charityPercent ?? 10.0;

  return prisma.subscription.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      planType: params.planType,
      status: 'ACTIVE',
      price: plan.price,
      charityId: params.charityId || null,
      charityPercent,
      currentPeriodStart: now,
      renewalDate: renewal,
      stripeSubscriptionId: params.stripeSubscriptionId || null,
      stripeCustomerId: params.stripeCustomerId || null,
    },
    update: {
      planType: params.planType,
      status: 'ACTIVE',
      price: plan.price,
      charityId: params.charityId !== undefined ? params.charityId : undefined,
      charityPercent: params.charityPercent !== undefined ? params.charityPercent : undefined,
      currentPeriodStart: now,
      renewalDate: renewal,
      cancelAtPeriodEnd: false,
    },
    include: {
      charity: true,
    },
  });
}

export async function toggleCancelAtPeriodEnd(userId: string) {
  const current = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!current) {
    throw new Error('NOT_FOUND: Subscription not found.');
  }

  return prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: !current.cancelAtPeriodEnd,
    },
  });
}

export async function checkSubscriberAccess(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub) return false;
  return sub.status === 'ACTIVE';
}

