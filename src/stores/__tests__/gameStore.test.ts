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
});
