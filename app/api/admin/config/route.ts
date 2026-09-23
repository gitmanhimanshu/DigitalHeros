import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPrizePoolConfig, updatePrizePoolConfig } from '@/lib/engine/draw';

export async function GET() {
  try {
    const config = await getPrizePoolConfig();
    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const { tier5Share, tier4Share, tier3Share, subscriberContributionRate } = body;

    // Validate tier shares sum to 1.0 (or close)
    const sum = Number(tier5Share) + Number(tier4Share) + Number(tier3Share);
    if (Math.abs(sum - 1.0) > 0.001) {
      return NextResponse.json(
        { error: `The sum of tier shares must equal 100% (currently ${(sum * 100).toFixed(1)}%).` },
        { status: 400 }
      );
    }

    const updated = await updatePrizePoolConfig({
      tier5Share: Number(tier5Share),
      tier4Share: Number(tier4Share),
      tier3Share: Number(tier3Share),
      subscriberContributionRate: Number(subscriberContributionRate),
    });

    return NextResponse.json({
      success: true,
      config: updated,
      message: 'Platform prize pool configurations updated successfully!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

