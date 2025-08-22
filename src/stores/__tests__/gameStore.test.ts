import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../gameStore';

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default state', () => {
    const store = useGameStore();
    
    expect(store.players).toHaveLength(2);
    expect(store.players[0].name).toBe('Player 1');
    expect(store.players[1].name).toBe('Player 2');
    expect(store.matchFormat).toBe('BO3');
    expect(store.currentGame).toBe(1);
    expect(store.currentPhase).toBe('setup');
  });

  it('should setup a match correctly', () => {
    const store = useGameStore();
    
    store.setupMatch({
      player1Name: 'Alice',
      player2Name: 'Bob',
      matchFormat: 'BO5',
      firstBan: 0,
      gentlemansAgreement: false,
    });
    
    expect(store.players[0].name).toBe('Alice');
    expect(store.players[1].name).toBe('Bob');
    expect(store.matchFormat).toBe('BO5');
    expect(store.currentPhase).toBe('banning');
    expect(store.banOrder).toHaveLength(7); // Game 1: 3-4-1 striking
  });

  it('should handle gentleman\'s agreement setup', () => {
    const store = useGameStore();
    
    store.setupMatch({
      player1Name: 'Alice',
      player2Name: 'Bob',
      matchFormat: 'BO3',
      firstBan: 0,
      gentlemansAgreement: true,
    });
    
    expect(store.currentPhase).toBe('selecting');
    expect(store.banOrder).toHaveLength(0);
  });

  it('should calculate set completion correctly for BO3', () => {
    const store = useGameStore();
    
    store.setupMatch({
      player1Name: 'Alice',
      player2Name: 'Bob',
      matchFormat: 'BO3',
      firstBan: 0,
      gentlemansAgreement: false,
    });
    
    // Alice wins first game
    store.players[0].score = 1;
    expect(store.isSetComplete).toBe(false);
    
    // Alice wins second game
    store.players[0].score = 2;
    expect(store.isSetComplete).toBe(true);
    expect(store.setWinner?.name).toBe('Alice');
  });

  it('should allow unbanning stages during banning phase', () => {
    const store = useGameStore();
    
    store.setupMatch({
      player1Name: 'Alice',
      player2Name: 'Bob',
      matchFormat: 'BO3',
      firstBan: 0,
      gentlemansAgreement: false,
    });
    
    // Alice bans a stage
    store.banStage('battlefield');
    expect(store.stageBans.has('battlefield')).toBe(true);
    expect(store.currentBanIndex).toBe(1);
    
    // Alice unbans the stage
    store.unbanStage('battlefield');
    expect(store.stageBans.has('battlefield')).toBe(false);
    expect(store.currentBanIndex).toBe(0);
    expect(store.currentPhase).toBe('banning');
  });

  it('should only allow players to unban their own stages', () => {
    const store = useGameStore();
    
    store.setupMatch({
      player1Name: 'Alice',
      player2Name: 'Bob',
      matchFormat: 'BO3',
      firstBan: 0,
      gentlemansAgreement: false,
    });
    
    // Alice bans a stage
    store.banStage('battlefield');
    expect(store.stageBans.has('battlefield')).toBe(true);
    expect(store.currentBanIndex).toBe(1);
    
    // Manually set currentBanIndex to simulate Bob's turn (player 1)
    // Bob's first turn is at index 3 in the ban order
    store.currentBanIndex = 3;
    
    // Bob's turn - he should not be able to unban Alice's stage
    expect(() => store.unbanStage('battlefield')).toThrow('Cannot unban stage battlefield at this time');
    expect(store.stageBans.has('battlefield')).toBe(true);
    expect(store.currentBanIndex).toBe(3); // Should remain at Bob's turn
  });
});
