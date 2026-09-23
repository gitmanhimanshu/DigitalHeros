import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { reviewWinnerProof } from '@/lib/engine/verification';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action, adminNotes } = body;

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { error: 'Action must be either APPROVE or REJECT.' },
        { status: 400 }
      );
    }

    const updated = await reviewWinnerProof(
      params.id,
      user.id,
      action,
      adminNotes
    );

    return NextResponse.json({
      success: true,
      verification: updated,
      message: `Winner proof has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

