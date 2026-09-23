const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Digital Heroes database seeding...');

  // 1. Platform Settings
  await prisma.platformSetting.upsert({
    where: { key: 'prize_pool_config' },
    update: {},
    create: {
      key: 'prize_pool_config',
      value: JSON.stringify({
        tier5Share: 0.40,
        tier4Share: 0.35,
        tier3Share: 0.25,
        subscriberContributionRate: 0.50,
      }),
    },
  });

  // 2. Seed Charities
  const charitiesData = [
    {
      name: 'Youth on Course',
      slug: 'youth-on-course',
      category: 'Youth',
      mission: 'Providing youth with transformative access to life-changing opportunities and mentorship on and off the course.',
      description: 'Youth on Course subsidizes rounds of golf for young people, helping them stay active, learn core life values, and qualify for higher-education scholarships.',
      logoUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=200&auto=format&fit=crop&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200&auto=format&fit=crop&q=80',
      featured: true,
      totalRaised: 14850.0,
      activeSupporters: 210,
      upcomingEvents: JSON.stringify([
        {
          name: 'Spring Junior Scramble',
          date: '2026-04-18',
          location: 'Pine Valley Memorial Club',
          description: 'A 9-hole scramble pairing junior scholars with club members to fund high-school scholarships.',
        },
        {
          name: 'National Leadership Summit',
          date: '2026-06-12',
          location: 'Chicago Convention Pavilion',
          description: 'Annual gathering of youth scholars focusing on careers, leadership, and athletic development.',
        },
      ]),
    },
    {
      name: 'Folds of Honor',
      slug: 'folds-of-honor',
      category: 'Veterans',
      mission: 'Honoring sacrifice by educating the legacy of fallen and disabled American military and first responders.',
      description: 'Since 2007, Folds of Honor has awarded tens of thousands of academic scholarships to spouses and children of fallen and disabled service members.',
      logoUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&auto=format&fit=crop&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1569420038815-e2d431c4b79b?w=1200&auto=format&fit=crop&q=80',
      featured: true,
      totalRaised: 28400.0,
      activeSupporters: 380,
      upcomingEvents: JSON.stringify([
        {
          name: 'Patriot Memorial Charity Classic',
          date: '2026-05-25',
          location: 'Liberty National Golf Club',
          description: 'A marquee charity outing honoring military families with 100% of proceeds supporting collegiate scholarships.',
        },
      ]),
    },
    {
      name: 'Fore The Planet',
      slug: 'fore-the-planet',
      category: 'Environment',
      mission: 'Restoring coastal wetlands and critical biodiversity corridors supported by the sporting world.',
      description: 'Fore The Planet partners with athletic communities to plant native trees, clean waterways, and restore wildlife ecosystems.',
      logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&auto=format&fit=crop&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
      featured: false,
      totalRaised: 9320.0,
      activeSupporters: 145,
      upcomingEvents: JSON.stringify([
        {
          name: 'Coastal Riparian Planting Day',
          date: '2026-04-22',
          location: 'Monterey Bay Wetland Preserve',
          description: 'Volunteer planting day to reinforce fragile dunes and clean plastic runoff.',
        },
      ]),
    },
    {
      name: 'Heart & Wellness Alliance',
      slug: 'heart-wellness-alliance',
      category: 'Health',
      mission: 'Preventing cardiovascular disease through community screening and athletic wellness initiatives.',
      description: 'Providing mobile heart screenings and CPR training for sports clubs, amateur leagues, and underserved communities.',
      logoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
      featured: false,
      totalRaised: 12150.0,
      activeSupporters: 190,
      upcomingEvents: JSON.stringify([
        {
          name: 'Healthy Hearts Golf Challenge',
          date: '2026-05-10',
          location: 'Silverstone Country Club',
          description: 'Walking-only golf challenge raising awareness for aerobic health and early screening.',
        },
      ]),
    },
  ];

  const seededCharities = [];
  for (const c of charitiesData) {
    const charity = await prisma.charity.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    seededCharities.push(charity);
  }

  // 3. Admin Account
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@digitalheroes.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Digital Heroes Admin',
      email: 'admin@digitalheroes.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    },
  });

  // 4. Test Subscriber Account
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@digitalheroes.com' },
    update: {
      passwordHash: userPasswordHash,
      role: 'SUBSCRIBER',
    },
    create: {
      name: 'Alex Morgan',
      email: 'user@digitalheroes.com',
      passwordHash: userPasswordHash,
      role: 'SUBSCRIBER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  });

  // Subscription for test subscriber
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: testUser.id },
    update: {
      status: 'ACTIVE',
      planType: 'MONTHLY',
      price: 29.0,
      charityId: seededCharities[0].id,
      charityPercent: 15.0,
      renewalDate,
    },
    create: {
      userId: testUser.id,
      status: 'ACTIVE',
      planType: 'MONTHLY',
      price: 29.0,
      charityId: seededCharities[0].id,
      charityPercent: 15.0,
      renewalDate,
    },
  });

  // 5 Stableford Scores for Alex Morgan (matches example in PRD)
  const alexScores = [
    { score: 38, date: '2026-03-20', course: 'Pine Valley Memorial Club' },
    { score: 35, date: '2026-03-15', course: 'Augusta Trails' },
    { score: 41, date: '2026-03-10', course: 'St. Jude Links' },
    { score: 32, date: '2026-03-05', course: 'Cypress Point' },
    { score: 37, date: '2026-03-01', course: 'Bandon Dunes' },
  ];

  for (const s of alexScores) {
    const playedOn = new Date(`${s.date}T00:00:00.000Z`);
    await prisma.golfScore.upsert({
      where: {
        userId_playedOn: {
          userId: testUser.id,
          playedOn,
        },
      },
      update: { score: s.score, courseName: s.course },
      create: {
        userId: testUser.id,
        score: s.score,
        playedOn,
        courseName: s.course,
      },
    });
  }

  // 5. Additional active subscribers to populate draw simulations and community
  const extraUsersData = [
    {
      name: 'Sarah Jenkins',
      email: 'sarah@digitalheroes.com',
      scores: [
        { score: 34, date: '2026-03-21', course: 'Oakmont Hills' },
        { score: 38, date: '2026-03-16', course: 'Pinehurst No. 2' },
        { score: 42, date: '2026-03-11', course: 'Shinnecock Ridge' },
        { score: 29, date: '2026-03-06', course: 'Merion Golf Course' },
        { score: 36, date: '2026-03-02', course: 'Olympic Club' },
      ],
      charityIndex: 1,
      charityPercent: 20.0,
    },
    {
      name: 'Marcus Vance',
      email: 'marcus@digitalheroes.com',
      scores: [
        { score: 40, date: '2026-03-22', course: 'Winged Foot West' },
        { score: 39, date: '2026-03-18', course: 'Pebble Beach Links' },
        { score: 35, date: '2026-03-12', course: 'Whistling Straits' },
        { score: 41, date: '2026-03-07', course: 'Kiawah Island Ocean' },
        { score: 38, date: '2026-03-03', course: 'Bethpage Black' },
      ],
      charityIndex: 0,
      charityPercent: 10.0,
    },
    {
      name: 'David Kim',
      email: 'david@digitalheroes.com',
      scores: [
        { score: 33, date: '2026-03-19', course: 'Torrey Pines South' },
        { score: 31, date: '2026-03-14', course: 'Riviera Country Club' },
        { score: 38, date: '2026-03-09', course: 'Muirfield Village' },
        { score: 36, date: '2026-03-04', course: 'Southern Hills' },
        { score: 42, date: '2026-02-28', course: 'The Country Club' },
      ],
      charityIndex: 2,
      charityPercent: 25.0,
    },
  ];

  for (const extra of extraUsersData) {
    const user = await prisma.user.upsert({
      where: { email: extra.email },
      update: {},
      create: {
        name: extra.name,
        email: extra.email,
        passwordHash: userPasswordHash,
        role: 'SUBSCRIBER',
      },
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        status: 'ACTIVE',
        planType: 'MONTHLY',
        price: 29.0,
        charityId: seededCharities[extra.charityIndex].id,
        charityPercent: extra.charityPercent,
        renewalDate,
      },
      create: {
        userId: user.id,
        status: 'ACTIVE',
        planType: 'MONTHLY',
        price: 29.0,
        charityId: seededCharities[extra.charityIndex].id,
        charityPercent: extra.charityPercent,
        renewalDate,
      },
    });

    for (const sc of extra.scores) {
      const playedOn = new Date(`${sc.date}T00:00:00.000Z`);
      await prisma.golfScore.upsert({
        where: {
          userId_playedOn: {
            userId: user.id,
            playedOn,
          },
        },
        update: { score: sc.score, courseName: sc.course },
        create: {
          userId: user.id,
          score: sc.score,
          playedOn,
          courseName: sc.course,
        },
      });
    }
  }

  // 6. Past Published Draw with a Winner (Alex Morgan won 4-match!)
  const pastDraw = await prisma.draw.upsert({
    where: { drawNumber: 1 },
    update: {},
    create: {
      drawNumber: 1,
      title: 'Inaugural March Charity Draw',
      drawDate: new Date('2026-03-15T18:00:00.000Z'),
      status: 'PUBLISHED',
      drawLogic: 'RANDOM',
      cadence: 'MONTHLY',
      winningNumbers: JSON.stringify([32, 35, 37, 38, 44]), // Alex matched 32, 35, 37, 38 (4 numbers!)
      totalPrizePool: 2400.0,
      jackpotRolloverIn: 0.0,
      jackpotRolloverOut: 960.0, // 40% jackpot rolled over because no 5-match
      tier5WinnersCount: 0,
      tier4WinnersCount: 1,
      tier3WinnersCount: 2,
      tier5PrizePerWinner: 0.0,
      tier4PrizePerWinner: 840.0, // 35% of $2400
      tier3PrizePerWinner: 300.0, // 25% of $2400 / 2
      publishedAt: new Date('2026-03-15T18:30:00.000Z'),
    },
  });

  // Draw Entry for Alex Morgan
  const alexEntry = await prisma.drawEntry.upsert({
    where: {
      drawId_userId: {
        drawId: pastDraw.id,
        userId: testUser.id,
      },
    },
    update: {},
    create: {
      drawId: pastDraw.id,
      userId: testUser.id,
      userScores: JSON.stringify([38, 35, 41, 32, 37]),
      matchedCount: 4,
      matchedNumbers: JSON.stringify([32, 35, 37, 38]),
      tier: 'MATCH_4',
      prizeWon: 840.0,
    },
  });

  // Pending Winner Verification for Alex Morgan (ready for Admin to inspect and approve!)
  await prisma.winnerVerification.upsert({
    where: { id: 'seed-verification-alex-1' },
    update: {},
    create: {
      id: 'seed-verification-alex-1',
      drawId: pastDraw.id,
      drawEntryId: alexEntry.id,
      userId: testUser.id,
      tier: 'MATCH_4',
      prizeAmount: 840.0,
      proofImageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&auto=format&fit=crop&q=80',
      status: 'PENDING',
      payoutStatus: 'PENDING',
      adminNotes: 'Awaiting admin review of official golf app scorecard screenshot.',
    },
  });

  // 7. Upcoming Scheduled Draw (with the rolled-over jackpot!)
  await prisma.draw.upsert({
    where: { drawNumber: 2 },
    update: {},
    create: {
      drawNumber: 2,
      title: 'April 2026 Spring Charity Draw',
      drawDate: new Date('2026-04-15T18:00:00.000Z'),
      status: 'SCHEDULED',
      drawLogic: 'ALGORITHMIC',
      cadence: 'MONTHLY',
      totalPrizePool: 3200.0,
      jackpotRolloverIn: 960.0, // Rolled over from Draw #1
      jackpotRolloverOut: 0.0,
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('-------------------------------------------');
  console.log('🔑 TEST ACCOUNTS:');
  console.log('   Admin:      admin@digitalheroes.com / admin123');
  console.log('   Subscriber: user@digitalheroes.com / user123');
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

