import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createDirectDonation } from '@/lib/engine/charity';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { amount, donorName, donorEmail } = body;

    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid donation amount greater than $0.' },
        { status: 400 }
      );
    }

    const donation = await createDirectDonation({
      charityId: params.id,
      amount: donationAmount,
      userId: user?.id,
      donorName: donorName || user?.name || 'Anonymous Donor',
      donorEmail: donorEmail || user?.email,
      stripePaymentId: `demo_donation_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      donation,
      message: `Thank you! Your donation of $${donationAmount.toFixed(2)} was received with gratitude.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

