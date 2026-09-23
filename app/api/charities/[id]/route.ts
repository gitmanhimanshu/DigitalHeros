import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const charity = await prisma.charity.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        donations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!charity) {
      return NextResponse.json({ error: 'Charity not found.' }, { status: 404 });
    }

    return NextResponse.json({ charity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.charity.update({
      where: { id: params.id },
      data: {
        name: body.name,
        category: body.category,
        mission: body.mission,
        description: body.description,
        logoUrl: body.logoUrl,
        coverImageUrl: body.coverImageUrl,
        featured: body.featured !== undefined ? Boolean(body.featured) : undefined,
        active: body.active !== undefined ? Boolean(body.active) : undefined,
        upcomingEvents:
          body.upcomingEvents !== undefined
            ? typeof body.upcomingEvents === 'string'
              ? body.upcomingEvents
              : JSON.stringify(body.upcomingEvents)
            : undefined,
      },
    });

    return NextResponse.json({ success: true, charity: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    // Soft delete / deactivate
    const updated = await prisma.charity.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json({ success: true, charity: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

