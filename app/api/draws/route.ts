import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const draws = await prisma.draw.findMany({
      orderBy: { drawNumber: 'desc' },
      include: {
        _count: {
          select: { entries: true, verifications: true },
        },
      },
    });

    return NextResponse.json({ draws });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, drawDate, cadence = 'MONTHLY', drawLogic = 'RANDOM' } = body;

    if (!title || !drawDate) {
      return NextResponse.json(
        { error: 'Draw title and drawDate are required.' },
        { status: 400 }
      );
    }

    const latestDraw = await prisma.draw.findFirst({
      orderBy: { drawNumber: 'desc' },
    });
    const nextDrawNumber = (latestDraw?.drawNumber || 0) + 1;

    // Check if previous published draw had rollover
    let rolloverIn = 0;
    if (latestDraw && latestDraw.status === 'PUBLISHED') {
      rolloverIn = latestDraw.jackpotRolloverOut || 0;
    }

    const newDraw = await prisma.draw.create({
      data: {
        drawNumber: nextDrawNumber,
        title,
        drawDate: new Date(drawDate),
        cadence,
        drawLogic,
        status: 'SCHEDULED',
        jackpotRolloverIn: rolloverIn,
      },
    });

    return NextResponse.json({ success: true, draw: newDraw });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

