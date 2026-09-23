import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitWinnerProof } from '@/lib/engine/verification';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { verificationId, proofImageUrl } = body;

    if (!verificationId || !proofImageUrl) {
      return NextResponse.json(
        { error: 'verificationId and proofImageUrl are required.' },
        { status: 400 }
      );
    }

    const updated = await submitWinnerProof({
      verificationId,
      userId: user.id,
      proofImageUrl,
    });

    return NextResponse.json({
      success: true,
      verification: updated,
      message: 'Proof submitted successfully! Our administrators will review your scores.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

