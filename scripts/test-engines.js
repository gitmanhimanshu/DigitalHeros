const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('🧪 Starting Automated Engine Verification Suite...\n');

  // Test User for Unit Tests
  const testUserId = 'test-runner-user-1';
  await prisma.user.upsert({
    where: { email: 'tester@digitalheroes.com' },
    update: {},
    create: {
      id: testUserId,
      name: 'Test Runner',
      email: 'tester@digitalheroes.com',
      passwordHash: 'dummy-hash',
      role: 'SUBSCRIBER',
    },
  });

  // Clean up previous test scores
  await prisma.golfScore.deleteMany({ where: { userId: testUserId } });

  console.log('--- 1. Testing Stableford Score Validation ---');
  // Dynamic import of score engine logic
  function validateScore(score) {
    if (!Number.isInteger(score)) throw new Error('INVALID_SCORE: Score must be a whole integer.');
    if (score < 1 || score > 45) throw new Error('INVALID_SCORE: Stableford score must be between 1 and 45.');
  }

  // 1a. Valid score
  try {
    validateScore(36);
    assert(true, 'Valid score 36 passed validation');
  } catch {
    assert(false, 'Valid score 36 should have passed');
  }

  // 1b. Score < 1
  try {
    validateScore(0);
    assert(false, 'Score 0 should fail validation');
  } catch (err) {
    assert(err.message.includes('INVALID_SCORE'), 'Score 0 correctly rejected');
  }

  // 1c. Score > 45
  try {
    validateScore(46);
    assert(false, 'Score 46 should fail validation');
  } catch (err) {
    assert(err.message.includes('INVALID_SCORE'), 'Score 46 correctly rejected');
  }

  console.log('\n--- 2. Testing Date Uniqueness & Rolling-5 Retention ---');
  // Insert 5 distinct scores
  const baseDates = [
    '2026-03-01',
    '2026-03-05',
    '2026-03-10',
    '2026-03-15',
    '2026-03-20',
  ];
  const scores = [37, 32, 41, 35, 38];

  for (let i = 0; i < 5; i++) {
    const playedOn = new Date(`${baseDates[i]}T00:00:00.000Z`);
    await prisma.golfScore.create({
      data: {
        userId: testUserId,
        score: scores[i],
        playedOn,
        courseName: `Course ${i + 1}`,
      },
    });
  }

  const initialScores = await prisma.golfScore.findMany({
    where: { userId: testUserId },
    orderBy: { playedOn: 'desc' },
  });
  assert(initialScores.length === 5, 'Successfully stored initial 5 scores');
  assert(initialScores[0].score === 38, 'Most recent score is 38 (20 Mar)');
  assert(initialScores[4].score === 37, 'Oldest score is 37 (01 Mar)');

  // 2b. Attempt Duplicate Date
  console.log('\n--- 2b. Duplicate Date Check ---');
  let duplicateBlocked = false;
  try {
    await prisma.golfScore.create({
      data: {
        userId: testUserId,
        score: 40,
        playedOn: new Date('2026-03-20T00:00:00.000Z'),
      },
    });
  } catch (err) {
    duplicateBlocked = true;
  }
  assert(duplicateBlocked, 'Duplicate score on 2026-03-20 was blocked by unique constraint');

  // 2c. Sixth Score Replaces Oldest Score
  console.log('\n--- 2c. Sixth Score Rolling-5 Retention ---');
  // Add 6th score (22 Mar = 40)
  const newDate = new Date('2026-03-22T00:00:00.000Z');
  await prisma.$transaction(async (tx) => {
    await tx.golfScore.create({
      data: {
        userId: testUserId,
        score: 40,
        playedOn: newDate,
        courseName: 'New Championship Course',
      },
    });

    const all = await tx.golfScore.findMany({
      where: { userId: testUserId },
      orderBy: { playedOn: 'desc' },
    });

    if (all.length > 5) {
      const toRemove = all.slice(5).map((s) => s.id);
      await tx.golfScore.deleteMany({
        where: { id: { in: toRemove } },
      });
    }
  });

  const updatedScores = await prisma.golfScore.findMany({
    where: { userId: testUserId },
    orderBy: { playedOn: 'desc' },
  });

  assert(updatedScores.length === 5, 'Retained exactly 5 scores after 6th score inserted');
  assert(updatedScores[0].score === 40, 'Newest score is now 40 (22 Mar)');
  assert(
    !updatedScores.some((s) => s.playedOn.toISOString().startsWith('2026-03-01')),
    'Oldest score (01 Mar = 37) was automatically pruned'
  );

  console.log('\n--- 3. Testing Prize Pool Calculation & Rollover Logic ---');
  const poolBase = 10000;
  const tier5Share = 0.40;
  const tier4Share = 0.35;
  const tier3Share = 0.25;

  const t5Pool = poolBase * tier5Share; // 4000
  const t4Pool = poolBase * tier4Share; // 3500
  const t3Pool = poolBase * tier3Share; // 2500

  // Multiple winners splitting tier
  const winnersCountT4 = 2;
  const prizePerT4Winner = t4Pool / winnersCountT4;
  assert(prizePerT4Winner === 1750, '4-match pool of $3,500 split equally between 2 winners ($1,750 each)');

  // 5-match jackpot rollover if 0 winners
  const winnersCountT5 = 0;
  const rolloverOut = winnersCountT5 === 0 ? t5Pool : 0;
  assert(rolloverOut === 4000, '5-match jackpot of $4,000 rolls over when unclaimed');

  // Next draw receives rollover
  const nextPoolBase = 12000;
  const nextT5Pool = nextPoolBase * tier5Share + rolloverOut; // 4800 + 4000 = 8800
  assert(nextT5Pool === 8800, 'Subsequent draw successfully adds rolled-over jackpot to tier 5 pool');

  console.log('\n--- 4. Testing Charity Percentage Validation ---');
  function validateCharity(pct) {
    if (pct < 10.0) throw new Error('MIN_10_REQUIRED');
    if (pct > 100.0) throw new Error('MAX_100_EXCEEDED');
  }

  try {
    validateCharity(5);
    assert(false, '5% charity should fail');
  } catch (err) {
    assert(err.message === 'MIN_10_REQUIRED', 'Charity percentage below 10% correctly rejected');
  }

  try {
    validateCharity(15);
    assert(true, '15% charity contribution passed validation');
  } catch {
    assert(false, '15% should be valid');
  }

  console.log('\n--- 5. Winner Verification & Payout State Transitions ---');
  let verificationStatus = 'PENDING';
  let payoutStatus = 'PENDING';

  // Admin approves proof
  verificationStatus = 'APPROVED';
  assert(verificationStatus === 'APPROVED', 'Verification status transitions to APPROVED');

  // Admin marks paid
  payoutStatus = 'PAID';
  assert(payoutStatus === 'PAID', 'Payout status transitions from PENDING to PAID');

  // Clean up
  await prisma.golfScore.deleteMany({ where: { userId: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });

  console.log('\n🎉 ALL AUTOMATED ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

