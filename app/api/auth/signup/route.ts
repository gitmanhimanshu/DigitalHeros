import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, setSessionCookie, signToken } from '@/lib/auth';
import { validateCharityPercent } from '@/lib/engine/charity';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, planType = 'MONTHLY', charityId, charityPercent = 10.0 } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // Validate charity percentage
    await validateCharityPercent(Number(charityPercent));

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const renewalDate = new Date();
    if (planType === 'YEARLY') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const price = planType === 'YEARLY' ? 290.0 : 29.0;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: 'SUBSCRIBER',
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planType,
          status: 'ACTIVE',
          price,
          charityId: charityId || null,
          charityPercent: Number(charityPercent),
          renewalDate,
        },
        include: {
          charity: true,
        },
      });

      if (charityId) {
        await tx.charity.update({
          where: { id: charityId },
          data: {
            activeSupporters: { increment: 1 },
          },
        });
      }

      return { user, subscription };
    });

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as 'SUBSCRIBER' | 'ADMIN',
      name: result.user.name,
    });

    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        subscription: result.subscription,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}

