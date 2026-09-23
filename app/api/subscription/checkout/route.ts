import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createOrUpdateSubscription } from '@/lib/engine/subscription';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planType = 'MONTHLY', charityId, charityPercent = 10.0 } = body;

    // Direct native subscription checkout (simple assignment architecture without 3rd-party gateway)
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const updated = await createOrUpdateSubscription({
      userId: user.id,
      planType,
      charityId,
      charityPercent: Number(charityPercent),
      stripeSubscriptionId: transactionId,
      stripeCustomerId: `usr_${user.id.slice(0, 8)}`,
    });

    return NextResponse.json({
      success: true,
      subscription: updated,
      transactionId,
      message: 'Subscription successfully activated!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
