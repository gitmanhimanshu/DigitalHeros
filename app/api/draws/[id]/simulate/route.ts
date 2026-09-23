import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { simulateDraw } from '@/lib/engine/draw';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { drawLogic, customWinningNumbers } = body;

    const simulation = await simulateDraw(params.id, {
      drawLogic,
      customWinningNumbers,
    });

    return NextResponse.json({
      success: true,
      simulation,
      message: 'Simulation completed! Results are previewed without being published.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

