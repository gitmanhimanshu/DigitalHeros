import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggleCancelAtPeriodEnd } from '@/lib/engine/subscription';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await toggleCancelAtPeriodEnd(user.id);
    const message = updated.cancelAtPeriodEnd
      ? 'Auto-renewal has been cancelled. Your membership remains active until the end of your current billing period.'
      : 'Auto-renewal reactivated! Your membership will seamlessly continue.';

    return NextResponse.json({
      success: true,
      subscription: updated,
      message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

