import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteScore, editScore } from '@/lib/engine/scores';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { score, playedOn, courseName, notes } = body;

    const result = await editScore(user.id, params.id, {
      score: score !== undefined ? Number(score) : undefined,
      playedOn,
      courseName,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Score updated successfully!',
    });
  } catch (error: any) {
    const isDuplicate = error.message?.includes('DUPLICATE_DATE');
    const isInvalid = error.message?.includes('INVALID_SCORE');
    const status = isDuplicate || isInvalid ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedScores = await deleteScore(user.id, params.id);
    return NextResponse.json({
      success: true,
      scores: updatedScores,
      message: 'Score removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

