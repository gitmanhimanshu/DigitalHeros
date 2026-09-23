import prisma from '../prisma';

export interface PrizePoolConfig {
  tier5Share: number; // e.g. 0.40
  tier4Share: number; // e.g. 0.35
  tier3Share: number; // e.g. 0.25
  subscriberContributionRate: number; // e.g. 0.50 (50% of monthly fee)
}

export const DEFAULT_PRIZE_CONFIG: PrizePoolConfig = {
  tier5Share: 0.40,
  tier4Share: 0.35,
  tier3Share: 0.25,
  subscriberContributionRate: 0.50,
};

export async function getPrizePoolConfig(): Promise<PrizePoolConfig> {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: 'prize_pool_config' },
    });
    if (setting) {
      return JSON.parse(setting.value);
    }
  } catch {
    // fallback to default
  }
  return DEFAULT_PRIZE_CONFIG;
}

export async function updatePrizePoolConfig(config: Partial<PrizePoolConfig>) {
  const current = await getPrizePoolConfig();
  const updated = { ...current, ...config };
  await prisma.platformSetting.upsert({
    where: { key: 'prize_pool_config' },
    create: {
      key: 'prize_pool_config',
      value: JSON.stringify(updated),
    },
    update: {
      value: JSON.stringify(updated),
    },
  });
  return updated;
}

/**
 * Standard random lottery draw: 5 unique numbers between 1 and 45.
 */
export function generateRandomNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Algorithmic draw: 5 unique numbers weighted by score frequency among active subscribers.
 * Uses Laplace smoothing (+1 count) so every number 1-45 has a chance to be picked.
 */
export async function generateAlgorithmicNumbers(): Promise<number[]> {
  // Fetch latest scores of active subscribers
  const activeSubscribers = await prisma.user.findMany({
    where: {
      subscription: {
        status: 'ACTIVE',
      },
    },
    include: {
      scores: {
        orderBy: { playedOn: 'desc' },
        take: 5,
      },
    },
  });

  const frequencyMap = new Map<number, number>();
  for (let i = 1; i <= 45; i++) {
    frequencyMap.set(i, 1); // Laplace smoothing: base weight of 1
  }

  activeSubscribers.forEach((user) => {
    user.scores.forEach((s) => {
      if (s.score >= 1 && s.score <= 45) {
        frequencyMap.set(s.score, (frequencyMap.get(s.score) || 1) + 1);
      }
    });
  });

  const selected = new Set<number>();
  while (selected.size < 5) {
    // Build roulette wheel from available candidates
    const candidates: { num: number; weight: number }[] = [];
    let totalWeight = 0;

    for (let i = 1; i <= 45; i++) {
      if (!selected.has(i)) {
        const w = frequencyMap.get(i) || 1;
        candidates.push({ num: i, weight: w });
        totalWeight += w;
      }
    }

    const randomVal = Math.random() * totalWeight;
    let running = 0;
    for (const c of candidates) {
      running += c.weight;
      if (randomVal <= running) {
        selected.add(c.num);
        break;
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

export interface DrawSimulationParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  scores: number[];
  matchedCount: number;
  matchedNumbers: number[];
  tier: 'MATCH_5' | 'MATCH_4' | 'MATCH_3' | 'NONE';
  prizeWon: number;
}

export interface DrawSimulationResult {
  drawId: string;
  drawNumber: number;
  winningNumbers: number[];
  drawLogic: 'RANDOM' | 'ALGORITHMIC';
  totalPrizePool: number;
  basePoolFromSubscriptions: number;
  jackpotRolloverIn: number;
  jackpotRolloverOut: number;
  participantsCount: number;
  tier5WinnersCount: number;
  tier4WinnersCount: number;
  tier3WinnersCount: number;
  tier5PrizePerWinner: number;
  tier4PrizePerWinner: number;
  tier3PrizePerWinner: number;
  participants: DrawSimulationParticipant[];
}

/**
 * Runs a draw simulation.
 * Calculates prize distribution and winners without publishing or creating live winner notifications.
 */
export async function simulateDraw(
  drawId: string,
  options?: {
    drawLogic?: 'RANDOM' | 'ALGORITHMIC';
    customWinningNumbers?: number[];
  }
): Promise<DrawSimulationResult> {
  const draw = await prisma.draw.findUnique({
    where: { id: drawId },
  });

  if (!draw) {
    throw new Error('NOT_FOUND: Draw record not found.');
  }

  const config = await getPrizePoolConfig();
  const logic = options?.drawLogic || (draw.drawLogic as 'RANDOM' | 'ALGORITHMIC') || 'RANDOM';

  // 1. Determine winning numbers
  let winningNumbers: number[];
  if (options?.customWinningNumbers && options.customWinningNumbers.length === 5) {
    winningNumbers = [...options.customWinningNumbers].sort((a, b) => a - b);
  } else if (logic === 'ALGORITHMIC') {
    winningNumbers = await generateAlgorithmicNumbers();
  } else {
    winningNumbers = generateRandomNumbers();
  }

  // 2. Query all active subscribers and their retained 5 scores
  const activeSubscribers = await prisma.user.findMany({
    where: {
      subscription: {
        status: 'ACTIVE',
      },
    },
    include: {
      subscription: true,
      scores: {
        orderBy: { playedOn: 'desc' },
        take: 5,
      },
    },
  });

  // 3. Calculate Prize Pool
  // Sum contribution from each subscriber
  let basePool = 0;
  for (const sub of activeSubscribers) {
    const monthlyEquivalent = sub.subscription?.planType === 'YEARLY' ? 290 / 12 : 29.0;
    basePool += monthlyEquivalent * config.subscriberContributionRate;
  }

  // Base pool can also have a minimum baseline so draws are exciting
  if (basePool < 500) {
    basePool = 500; // Minimum baseline for demo/platform launch
  }

  const rolloverIn = draw.jackpotRolloverIn || 0;
  const totalPrizePool = Math.round(basePool + rolloverIn);

  // 4. Match scores for each subscriber
  const winSet = new Set(winningNumbers);
  const match5Participants: DrawSimulationParticipant[] = [];
  const match4Participants: DrawSimulationParticipant[] = [];
  const match3Participants: DrawSimulationParticipant[] = [];
  const allEvaluatedParticipants: DrawSimulationParticipant[] = [];

  for (const user of activeSubscribers) {
    const scores = user.scores.map((s) => s.score);
    const matchedNumbers = scores.filter((num) => winSet.has(num));
    const matchedCount = matchedNumbers.length;

    let tier: 'MATCH_5' | 'MATCH_4' | 'MATCH_3' | 'NONE' = 'NONE';
    if (matchedCount === 5) tier = 'MATCH_5';
    else if (matchedCount === 4) tier = 'MATCH_4';
    else if (matchedCount === 3) tier = 'MATCH_3';

    const p: DrawSimulationParticipant = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      scores,
      matchedCount,
      matchedNumbers,
      tier,
      prizeWon: 0,
    };

    allEvaluatedParticipants.push(p);

    if (tier === 'MATCH_5') match5Participants.push(p);
    else if (tier === 'MATCH_4') match4Participants.push(p);
    else if (tier === 'MATCH_3') match3Participants.push(p);
  }

  // 5. Calculate Tier Pools & Prize per winner
  // 5-match: 40% of base pool + rolloverIn
  const tier5TotalFund = basePool * config.tier5Share + rolloverIn;
  const tier4TotalFund = basePool * config.tier4Share;
  const tier3TotalFund = basePool * config.tier3Share;

  let tier5PrizePerWinner = 0;
  let jackpotRolloverOut = 0;

  if (match5Participants.length > 0) {
    tier5PrizePerWinner = Math.round((tier5TotalFund / match5Participants.length) * 100) / 100;
    match5Participants.forEach((p) => (p.prizeWon = tier5PrizePerWinner));
  } else {
    // PRD: 5-match jackpot carries forward if unclaimed!
    jackpotRolloverOut = Math.round(tier5TotalFund * 100) / 100;
  }

  let tier4PrizePerWinner = 0;
  if (match4Participants.length > 0) {
    tier4PrizePerWinner = Math.round((tier4TotalFund / match4Participants.length) * 100) / 100;
    match4Participants.forEach((p) => (p.prizeWon = tier4PrizePerWinner));
  }

  let tier3PrizePerWinner = 0;
  if (match3Participants.length > 0) {
    tier3PrizePerWinner = Math.round((tier3TotalFund / match3Participants.length) * 100) / 100;
    match3Participants.forEach((p) => (p.prizeWon = tier3PrizePerWinner));
  }

  const result: DrawSimulationResult = {
    drawId: draw.id,
    drawNumber: draw.drawNumber,
    winningNumbers,
    drawLogic: logic,
    totalPrizePool,
    basePoolFromSubscriptions: Math.round(basePool * 100) / 100,
    jackpotRolloverIn: rolloverIn,
    jackpotRolloverOut,
    participantsCount: activeSubscribers.length,
    tier5WinnersCount: match5Participants.length,
    tier4WinnersCount: match4Participants.length,
    tier3WinnersCount: match3Participants.length,
    tier5PrizePerWinner,
    tier4PrizePerWinner,
    tier3PrizePerWinner,
    participants: allEvaluatedParticipants,
  };

  // Cache simulation data on draw record for instant review without altering status to PUBLISHED
  await prisma.draw.update({
    where: { id: drawId },
    data: {
      status: draw.status === 'PUBLISHED' ? 'PUBLISHED' : 'SIMULATED',
      drawLogic: logic,
      winningNumbers: JSON.stringify(winningNumbers),
      simulationData: JSON.stringify(result),
    },
  });

  return result;
}

/**
 * Publishes a draw.
 * Idempotent: Can be safely re-run or executed from simulated state.
 * Records Draw entries and creates pending WinnerVerification items.
 */
export async function publishDraw(drawId: string, customWinningNumbers?: number[]) {
  // Re-run or obtain simulation data
  const simulation = await simulateDraw(drawId, {
    customWinningNumbers,
  });

  return prisma.$transaction(async (tx) => {
    // 1. Update Draw record
    const updatedDraw = await tx.draw.update({
      where: { id: drawId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        winningNumbers: JSON.stringify(simulation.winningNumbers),
        totalPrizePool: simulation.totalPrizePool,
        jackpotRolloverIn: simulation.jackpotRolloverIn,
        jackpotRolloverOut: simulation.jackpotRolloverOut,
        tier5WinnersCount: simulation.tier5WinnersCount,
        tier4WinnersCount: simulation.tier4WinnersCount,
        tier3WinnersCount: simulation.tier3WinnersCount,
        tier5PrizePerWinner: simulation.tier5PrizePerWinner,
        tier4PrizePerWinner: simulation.tier4PrizePerWinner,
        tier3PrizePerWinner: simulation.tier3PrizePerWinner,
      },
    });

    // 2. Persist DrawEntry for each participant
    for (const p of simulation.participants) {
      const entry = await tx.drawEntry.upsert({
        where: {
          drawId_userId: {
            drawId,
            userId: p.userId,
          },
        },
        create: {
          drawId,
          userId: p.userId,
          userScores: JSON.stringify(p.scores),
          matchedCount: p.matchedCount,
          matchedNumbers: JSON.stringify(p.matchedNumbers),
          tier: p.tier,
          prizeWon: p.prizeWon,
        },
        update: {
          userScores: JSON.stringify(p.scores),
          matchedCount: p.matchedCount,
          matchedNumbers: JSON.stringify(p.matchedNumbers),
          tier: p.tier,
          prizeWon: p.prizeWon,
        },
      });

      // 3. If participant won a tier (3, 4, or 5), create WinnerVerification record
      if (p.tier !== 'NONE' && p.prizeWon > 0) {
        const existingVerification = await tx.winnerVerification.findFirst({
          where: {
            drawId,
            userId: p.userId,
          },
        });

        if (!existingVerification) {
          await tx.winnerVerification.create({
            data: {
              drawId,
              drawEntryId: entry.id,
              userId: p.userId,
              tier: p.tier,
              prizeAmount: p.prizeWon,
              status: 'PENDING',
              payoutStatus: 'PENDING',
            },
          });
        }
      }
    }

    // 4. If jackpot rolled over, carry it forward to next scheduled draw if one exists
    if (simulation.jackpotRolloverOut > 0) {
      const nextDraw = await tx.draw.findFirst({
        where: {
          drawNumber: { gt: updatedDraw.drawNumber },
          status: 'SCHEDULED',
        },
        orderBy: { drawNumber: 'asc' },
      });

      if (nextDraw) {
        await tx.draw.update({
          where: { id: nextDraw.id },
          data: {
            jackpotRolloverIn: simulation.jackpotRolloverOut,
          },
        });
      }
    }

    return {
      draw: updatedDraw,
      simulation,
    };
  });
}

