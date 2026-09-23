import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { markPayoutAsPaid } from '@/lib/engine/verification';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const updated = await markPayoutAsPaid(params.id, user.id);

    return NextResponse.json({
      success: true,
      verification: updated,
      message: 'Payout status updated to PAID successfully!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

