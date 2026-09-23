import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const [
      totalUsers,
      activeSubscribers,
      totalCharities,
      draws,
      charities,
      allScores,
      verifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.charity.count({ where: { active: true } }),
      prisma.draw.findMany({ orderBy: { drawNumber: 'desc' } }),
      prisma.charity.findMany({ select: { name: true, totalRaised: true } }),
      prisma.golfScore.findMany({ select: { score: true } }),
      prisma.winnerVerification.findMany({ select: { prizeAmount: true, payoutStatus: true } }),
    ]);

    // Calculate total prize pool across published draws
    let totalPrizePoolPublished = 0;
    let totalPaidOut = 0;
    let totalPendingPayout = 0;

    draws.forEach((d) => {
      if (d.status === 'PUBLISHED') {
        totalPrizePoolPublished += d.totalPrizePool;
      }
    });

    verifications.forEach((v) => {
      if (v.payoutStatus === 'PAID') {
        totalPaidOut += v.prizeAmount;
      } else {
        totalPendingPayout += v.prizeAmount;
      }
    });

    // Total charity funds raised
    const totalCharityRaised = charities.reduce((sum, c) => sum + c.totalRaised, 0);

    // Latest rollover balance
    const latestPublished = draws.find((d) => d.status === 'PUBLISHED');
    const currentRolloverJackpot = latestPublished ? latestPublished.jackpotRolloverOut : 0;

    // Score frequency distribution for golf statistics (1-45)
    const scoreFrequency: Record<number, number> = {};
    for (let i = 1; i <= 45; i++) scoreFrequency[i] = 0;
    allScores.forEach((s) => {
      scoreFrequency[s.score] = (scoreFrequency[s.score] || 0) + 1;
    });

    return NextResponse.json({
      analytics: {
        totalUsers,
        activeSubscribers,
        totalCharities,
        totalPrizePoolPublished,
        totalPaidOut,
        totalPendingPayout,
        totalCharityRaised,
        currentRolloverJackpot,
        drawCount: draws.length,
        charityBreakdown: charities,
        scoreFrequency,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

