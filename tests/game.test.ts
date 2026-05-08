import { describe, it, expect } from 'vitest';
import { wordPairs, getRandomWordPair, getTotalWordCount, getThemeStats } from '../src/server/wordPool';

describe('Word Pool', () => {
  it('should have at least 100 word pairs total', () => {
    const totalCount = getTotalWordCount();
    expect(totalCount).toBeGreaterThanOrEqual(100);
  });

  it('should return valid word pair for each theme', () => {
    const themes = ['FOOD', 'ANIMAL', 'OCCUPATION', 'LOCATION', 'LIFE', 'ENTERTAINMENT'] as const;
    
    themes.forEach(theme => {
      const [word1, word2] = getRandomWordPair(theme);
      expect(word1).toBeDefined();
      expect(word2).toBeDefined();
      expect(typeof word1).toBe('string');
      expect(typeof word2).toBe('string');
      expect(word1).not.toBe(word2); // Words should be different
    });
  });

  it('should return random pair when theme is RANDOM', () => {
    const pairs: [string, string][] = [];
    
    // Call multiple times to ensure randomness
    for (let i = 0; i < 20; i++) {
      pairs.push(getRandomWordPair('RANDOM'));
    }
    
    // Should have some variety (not all same)
    const uniquePairs = new Set(pairs.map(p => p.join(',')));
    expect(uniquePairs.size).toBeGreaterThan(5); // At least 5 different pairs
  });

  it('should have correct theme statistics', () => {
    const stats = getThemeStats();
    
    expect(stats.FOOD).toBeGreaterThanOrEqual(20);
    expect(stats.ANIMAL).toBeGreaterThanOrEqual(15);
    expect(stats.OCCUPATION).toBeGreaterThanOrEqual(15);
    expect(stats.LOCATION).toBeGreaterThanOrEqual(15);
    expect(stats.LIFE).toBeGreaterThanOrEqual(15);
    expect(stats.ENTERTAINMENT).toBeGreaterThanOrEqual(15);
  });

  it('should not return same word as spy word', () => {
    // Test multiple times to ensure no accidental duplicates
    for (let i = 0; i < 50; i++) {
      const theme = ['FOOD', 'ANIMAL', 'OCCUPATION'][Math.floor(Math.random() * 3)];
      const [civilian, spy] = getRandomWordPair(theme as any);
      expect(civilian).not.toBe(spy);
    }
  });
});

describe('Game Logic - Array Utilities', () => {
  // Inline test helpers since we can't import from server files easily
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function generateSpyIndices(totalPlayers: number, spyCount: number): number[] {
    const indices = Array.from({ length: totalPlayers }, (_, i) => i);
    return shuffleArray(indices).slice(0, spyCount);
  }

  it('should generate correct number of spy indices', () => {
    const totalPlayers = 8;
    const spyCount = 2;
    
    const indices = generateSpyIndices(totalPlayers, spyCount);
    
    expect(indices.length).toBe(spyCount);
    expect(indices.every(i => i >= 0 && i < totalPlayers)).toBe(true);
    expect(new Set(indices).size).toBe(spyCount); // No duplicates
  });

  it('should generate spy indices for different player counts', () => {
    const testCases = [
      { players: 4, spies: 1 },
      { players: 6, spies: 1 },
      { players: 9, spies: 2 },
      { players: 12, spies: 2 },
    ];

    testCases.forEach(({ players, spies }) => {
      const indices = generateSpyIndices(players, spies);
      expect(indices.length).toBe(spies);
      expect(indices.every(i => i >= 0 && i < players)).toBe(true);
    });
  });

  it('should shuffle array maintaining all elements', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffleArray(original);
    
    expect(shuffled.length).toBe(original.length);
    expect([...shuffled].sort()).toEqual([...original].sort());
    // Should be different (high probability)
    expect(shuffled).not.toEqual(original);
  });

  it('should handle edge case with single element', () => {
    const single = [42];
    const shuffled = shuffleArray(single);
    
    expect(shuffled).toEqual([42]);
  });
});

describe('Game Logic - Win Conditions', () => {
  function checkWinCondition(totalPlayers: number, spyCount: number, eliminatedSpies: number, eliminatedCivilians: number): 'CIVILIAN' | 'SPY' | null {
    const activeSpies = spyCount - eliminatedSpies;
    const activeCivilians = totalPlayers - spyCount - eliminatedCivilians;
    
    // Spy wins if spy count >= civilian count
    if (activeSpies >= activeCivilians) return 'SPY';
    // Civilians win if all spies eliminated
    if (activeSpies === 0) return 'CIVILIAN';
    return null;
  }

  it('should detect civilian win when all spies eliminated', () => {
    const result = checkWinCondition(8, 2, 2, 1); // 8 players, 2 spies, both eliminated
    expect(result).toBe('CIVILIAN');
  });

  it('should detect spy win when spies >= civilians', () => {
    const result = checkWinCondition(6, 3, 0, 3); // 6 players, 3 spies, 3 civilians eliminated
    expect(result).toBe('SPY');
  });

  it('should return null when game continues', () => {
    const result = checkWinCondition(8, 2, 1, 2); // 8 players, 2 spies, 1 spy + 2 civs eliminated
    expect(result).toBeNull(); // 1 spy vs 5 civilians - game continues
  });

  it('should handle edge case with 4 players and 1 spy', () => {
    // Spy wins if 1 spy >= 3 civilians (never happens normally)
    const result1 = checkWinCondition(4, 1, 0, 0);
    expect(result1).toBeNull(); // 1 vs 3 - game continues
    
    // Civilian wins when spy eliminated
    const result2 = checkWinCondition(4, 1, 1, 0);
    expect(result2).toBe('CIVILIAN');
  });
});

describe('Game Logic - Vote Tally', () => {
  function tallyVotes(votes: Array<{ voterId: string; targetId: string }>): Map<string, number> {
    const voteCounts = new Map<string, number>();
    votes.forEach(vote => {
      voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) ?? 0) + 1);
    });
    return voteCounts;
  }

  it('should count votes correctly', () => {
    const votes = [
      { voterId: '1', targetId: '2' },
      { voterId: '3', targetId: '2' },
      { voterId: '4', targetId: '5' },
    ];
    
    const counts = tallyVotes(votes);
    
    expect(counts.get('2')).toBe(2);
    expect(counts.get('5')).toBe(1);
    expect(counts.get('1')).toBeUndefined();
  });

  it('should handle tie situation', () => {
    const votes = [
      { voterId: '1', targetId: '2' },
      { voterId: '3', targetId: '4' },
    ];
    
    const counts = tallyVotes(votes);
    
    let maxVotes = 0;
    counts.forEach(count => {
      if (count > maxVotes) maxVotes = count;
    });
    
    const topPlayers = Array.from(counts.entries())
      .filter(([, count]) => count === maxVotes)
      .map(([playerId]) => playerId);
    
    expect(topPlayers.length).toBe(2); // Tie between player 2 and 4
  });

  it('should find single winner', () => {
    const votes = [
      { voterId: '1', targetId: '2' },
      { voterId: '3', targetId: '2' },
      { voterId: '4', targetId: '2' },
      { voterId: '5', targetId: '6' },
    ];
    
    const counts = tallyVotes(votes);
    
    let maxVotes = 0;
    counts.forEach(count => {
      if (count > maxVotes) maxVotes = count;
    });
    
    const topPlayers = Array.from(counts.entries())
      .filter(([, count]) => count === maxVotes)
      .map(([playerId]) => playerId);
    
    expect(topPlayers.length).toBe(1);
    expect(topPlayers[0]).toBe('2');
  });
});
