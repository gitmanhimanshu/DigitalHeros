import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addScore, getUserScores } from '@/lib/engine/scores';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scores = await getUserScores(user.id);
    return NextResponse.json({ scores });
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

    // Check subscription active status
    if (user.role !== 'ADMIN' && user.subscription?.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'An active subscription is required to submit golf scores.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { score, playedOn, courseName, notes } = body;

    if (score === undefined || !playedOn) {
      return NextResponse.json(
        { error: 'Both score and playedOn date are required.' },
        { status: 400 }
      );
    }

    const result = await addScore(user.id, {
      score: Number(score),
      playedOn,
      courseName,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message:
        result.prunedCount > 0
          ? `Score recorded! The oldest score (${new Date(
              result.removedScores[0].playedOn
            ).toLocaleDateString()}) was automatically rolled off to retain your latest 5 rounds.`
          : 'Score recorded successfully!',
    });
  } catch (error: any) {
    const isDuplicate = error.message?.includes('DUPLICATE_DATE');
    const isInvalidScore = error.message?.includes('INVALID_SCORE');
    const status = isDuplicate || isInvalidScore ? 400 : 500;

    return NextResponse.json(
      { error: error.message || 'Failed to record golf score.' },
      { status }
    );
  }
}

