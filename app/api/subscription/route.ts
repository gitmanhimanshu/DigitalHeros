import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateSubscriberCharity } from '@/lib/engine/charity';
import { createOrUpdateSubscription } from '@/lib/engine/subscription';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      include: {
        charity: true,
      },
    });

    return NextResponse.json({ subscription });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, planType, charityId, charityPercent } = body;

    if (action === 'UPDATE_CHARITY') {
      if (!charityId || charityPercent === undefined) {
        return NextResponse.json(
          { error: 'charityId and charityPercent are required.' },
          { status: 400 }
        );
      }
      const updated = await updateSubscriberCharity(
        user.id,
        charityId,
        Number(charityPercent)
      );
      return NextResponse.json({
        success: true,
        subscription: updated,
        message: 'Charity preferences updated successfully!',
      });
    }

    if (action === 'SWITCH_PLAN') {
      if (!planType || (planType !== 'MONTHLY' && planType !== 'YEARLY')) {
        return NextResponse.json(
          { error: 'Invalid plan type selected.' },
          { status: 400 }
        );
      }
      const updated = await createOrUpdateSubscription({
        userId: user.id,
        planType,
      });
      return NextResponse.json({
        success: true,
        subscription: updated,
        message: `Plan changed to ${planType === 'YEARLY' ? 'Annual Champion' : 'Monthly Member'}!`,
      });
    }

    return NextResponse.json({ error: 'Invalid action requested.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

