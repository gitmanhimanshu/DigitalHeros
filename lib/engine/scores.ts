import prisma from '../prisma';

export const MIN_STABLEFORD_SCORE = 1;
export const MAX_STABLEFORD_SCORE = 45;
export const MAX_RETAINED_SCORES = 5;

export interface ScoreInput {
  score: number;
  playedOn: string | Date;
  courseName?: string;
  notes?: string;
}

/**
 * Normalizes a date to midnight UTC to prevent time-of-day discrepancy for the same calendar date.
 */
export function normalizeDate(dateInput: string | Date): Date {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  if (isNaN(d.getTime())) {
    throw new Error('INVALID_DATE: Please provide a valid date.');
  }
  // Normalize to YYYY-MM-DD at 00:00:00.000 UTC
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Validates a Stableford score.
 */
export function validateStablefordScore(score: number): void {
  if (!Number.isInteger(score)) {
    throw new Error('INVALID_SCORE: Score must be a whole integer.');
  }
  if (score < MIN_STABLEFORD_SCORE || score > MAX_STABLEFORD_SCORE) {
    throw new Error(
      `INVALID_SCORE: Stableford score must be between ${MIN_STABLEFORD_SCORE} and ${MAX_STABLEFORD_SCORE}.`
    );
  }
}

/**
 * Retrieves the latest retained 5 scores for a user, ordered newest first.
 */
export async function getUserScores(userId: string) {
  return prisma.golfScore.findMany({
    where: { userId },
    orderBy: { playedOn: 'desc' },
    take: MAX_RETAINED_SCORES,
  });
}

/**
 * Adds a new golf score for a user enforcing:
 * 1. Score range [1, 45]
 * 2. Strict 1 score per date uniqueness per user
 * 3. Atomic rolling-5 retention (oldest score automatically removed)
 */
export async function addScore(userId: string, input: ScoreInput) {
  validateStablefordScore(input.score);
  const normalizedDate = normalizeDate(input.playedOn);

  return prisma.$transaction(async (tx) => {
    // 1. Check for duplicate score on this date
    const existingOnDate = await tx.golfScore.findUnique({
      where: {
        userId_playedOn: {
          userId,
          playedOn: normalizedDate,
        },
      },
    });

    if (existingOnDate) {
      throw new Error(
        'DUPLICATE_DATE: Only one score entry is permitted per date. Duplicate scores for the same date are not allowed — an existing entry may only be edited or deleted.'
      );
    }

    // 2. Create the new score entry
    const createdScore = await tx.golfScore.create({
      data: {
        userId,
        score: input.score,
        playedOn: normalizedDate,
        courseName: input.courseName || null,
        notes: input.notes || null,
      },
    });

    // 3. Fetch all scores for this user sorted by playedOn DESC
    const allScores = await tx.golfScore.findMany({
      where: { userId },
      orderBy: { playedOn: 'desc' },
    });

    // 4. If more than 5, prune older scores beyond the latest 5
    if (allScores.length > MAX_RETAINED_SCORES) {
      const scoresToKeep = allScores.slice(0, MAX_RETAINED_SCORES);
      const scoresToRemove = allScores.slice(MAX_RETAINED_SCORES);
      const removeIds = scoresToRemove.map((s) => s.id);

      await tx.golfScore.deleteMany({
        where: {
          id: { in: removeIds },
        },
      });

      return {
        created: createdScore,
        retainedScores: scoresToKeep,
        prunedCount: scoresToRemove.length,
        removedScores: scoresToRemove,
      };
    }

    return {
      created: createdScore,
      retainedScores: allScores,
      prunedCount: 0,
      removedScores: [],
    };
  });
}

/**
 * Edits an existing score for a user.
 */
export async function editScore(
  userId: string,
  scoreId: string,
  input: { score?: number; playedOn?: string | Date; courseName?: string; notes?: string }
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.golfScore.findFirst({
      where: { id: scoreId, userId },
    });

    if (!existing) {
      throw new Error('NOT_FOUND: Score entry not found or unauthorized.');
    }

    let newDate = existing.playedOn;
    if (input.playedOn) {
      newDate = normalizeDate(input.playedOn);
      // If date changed, verify uniqueness
      if (newDate.getTime() !== existing.playedOn.getTime()) {
        const conflict = await tx.golfScore.findUnique({
          where: {
            userId_playedOn: {
              userId,
              playedOn: newDate,
            },
          },
        });
        if (conflict && conflict.id !== scoreId) {
          throw new Error(
            'DUPLICATE_DATE: Another score already exists for this date. You may edit or delete that entry instead.'
          );
        }
      }
    }

    const newScoreValue = input.score !== undefined ? input.score : existing.score;
    validateStablefordScore(newScoreValue);

    const updated = await tx.golfScore.update({
      where: { id: scoreId },
      data: {
        score: newScoreValue,
        playedOn: newDate,
        courseName: input.courseName !== undefined ? input.courseName : existing.courseName,
        notes: input.notes !== undefined ? input.notes : existing.notes,
      },
    });

    // Re-verify rolling 5 in case date changed and affected order
    const allScores = await tx.golfScore.findMany({
      where: { userId },
      orderBy: { playedOn: 'desc' },
    });

    if (allScores.length > MAX_RETAINED_SCORES) {
      const scoresToRemove = allScores.slice(MAX_RETAINED_SCORES);
      await tx.golfScore.deleteMany({
        where: { id: { in: scoresToRemove.map((s) => s.id) } },
      });
      return {
        updated,
        retainedScores: allScores.slice(0, MAX_RETAINED_SCORES),
      };
    }

    return {
      updated,
      retainedScores: allScores,
    };
  });
}

/**
 * Deletes an existing score for a user.
 */
export async function deleteScore(userId: string, scoreId: string) {
  const existing = await prisma.golfScore.findFirst({
    where: { id: scoreId, userId },
  });

  if (!existing) {
    throw new Error('NOT_FOUND: Score entry not found or unauthorized.');
  }

  await prisma.golfScore.delete({
    where: { id: scoreId },
  });

  return getUserScores(userId);
}

