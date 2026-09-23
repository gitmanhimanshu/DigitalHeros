import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { publishDraw } from '@/lib/engine/draw';

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
    const { customWinningNumbers } = body;

    const result = await publishDraw(params.id, customWinningNumbers);

    return NextResponse.json({
      success: true,
      draw: result.draw,
      simulation: result.simulation,
      message: 'Draw results published successfully! Winners have been notified in their dashboard.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

