import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const draw = await prisma.draw.findUnique({
      where: { id: params.id },
      include: {
        verifications: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!draw) {
      return NextResponse.json({ error: 'Draw not found.' }, { status: 404 });
    }

    // If subscriber, check if they have an entry in this draw
    let userEntry = null;
    if (user) {
      userEntry = await prisma.drawEntry.findUnique({
        where: {
          drawId_userId: {
            drawId: draw.id,
            userId: user.id,
          },
        },
      });
    }

    return NextResponse.json({
      draw: {
        ...draw,
        winningNumbers: JSON.parse(draw.winningNumbers || '[]'),
        simulationData: draw.simulationData ? JSON.parse(draw.simulationData) : null,
      },
      userEntry: userEntry
        ? {
            ...userEntry,
            userScores: JSON.parse(userEntry.userScores || '[]'),
            matchedNumbers: JSON.parse(userEntry.matchedNumbers || '[]'),
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

