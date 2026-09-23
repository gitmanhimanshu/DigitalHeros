import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const featuredOnly = searchParams.get('featured') === 'true';

    const where: any = { active: true };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { mission: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (featuredOnly) {
      where.featured = true;
    }

    const charities = await prisma.charity.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { totalRaised: 'desc' }],
    });

    return NextResponse.json({ charities });
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
    const { name, category, mission, description, logoUrl, coverImageUrl, featured, upcomingEvents } = body;

    if (!name || !category || !mission) {
      return NextResponse.json(
        { error: 'Name, category, and mission statement are required.' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const charity = await prisma.charity.create({
      data: {
        name,
        slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        category,
        mission,
        description: description || mission,
        logoUrl: logoUrl || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=200',
        coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200',
        featured: Boolean(featured),
        upcomingEvents: typeof upcomingEvents === 'string' ? upcomingEvents : JSON.stringify(upcomingEvents || []),
      },
    });

    return NextResponse.json({ success: true, charity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

