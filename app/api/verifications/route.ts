import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const payoutStatus = searchParams.get('payoutStatus');

    const where: any = {};

    // If regular subscriber, only return their own verifications
    if (user.role !== 'ADMIN') {
      where.userId = user.id;
    } else {
      // Admin filters
      if (status && status !== 'ALL') where.status = status;
      if (payoutStatus && payoutStatus !== 'ALL') where.payoutStatus = payoutStatus;
    }

    const verifications = await prisma.winnerVerification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        draw: {
          select: {
            id: true,
            drawNumber: true,
            title: true,
            drawDate: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ verifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

