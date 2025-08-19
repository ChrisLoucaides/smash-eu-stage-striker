import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SetCompleteView from '../SetCompleteView.vue'
import { useGameStore } from '../../stores/gameStore'

describe('SetCompleteView', () => {
  let pinia: any
  let gameStore: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    gameStore = useGameStore()
    
    // Reset store to default state
    gameStore.resetMatch()
    
    // Spy on store methods
    vi.spyOn(gameStore, 'resetMatch')
    vi.spyOn(gameStore, 'setupMatch')
  })

  it('renders correctly with winner information', () => {
    // Set up a completed match
    gameStore.players[0].name = 'Alice'
    gameStore.players[1].name = 'Bob'
    gameStore.players[0].score = 2
    gameStore.players[1].score = 1
    gameStore.currentGame = 3
    gameStore.matchFormat = 'BO3'
    gameStore.currentPhase = 'set-complete'
    
    // Add some game history for total bans calculation
    gameStore.gameHistory = [
      {
        gameNumber: 1,
        winner: 0,
        selectedStage: 'Battlefield',
        stageBans: [
          { stageId: 'stage1', playerIndex: 0 },
          { stageId: 'stage2', playerIndex: 1 }
        ]
      },
      {
        gameNumber: 2,
        winner: 1,
        selectedStage: 'Final Destination',
        stageBans: [
          { stageId: 'stage3', playerIndex: 0 }
        ]
      }
    ]
    
    const wrapper = mount(SetCompleteView)
    
    expect(wrapper.text()).toContain('Set Complete!')
    expect(wrapper.text()).toContain('Winner')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Alice: 2 - Bob: 1')
    expect(wrapper.text()).toContain('Best of 3')
    expect(wrapper.text()).toContain('Games Played: 2')
    expect(wrapper.text()).toContain('Total Stage Bans: 3')
  })

  it('displays correct winner when player 2 wins', () => {
    // Set up a completed match with player 2 winning
    gameStore.players[0].name = 'Alice'
    gameStore.players[1].name = 'Bob'
    gameStore.players[0].score = 1
    gameStore.players[1].score = 2
    gameStore.currentGame = 3
    gameStore.currentPhase = 'set-complete'
    
    const wrapper = mount(SetCompleteView)
    
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).toContain('Alice: 1 - Bob: 2')
  })

  it('displays correct match format for BO5', () => {
    gameStore.players[0].score = 3
    gameStore.players[1].score = 2
    gameStore.currentGame = 6
    gameStore.matchFormat = 'BO5'
    gameStore.currentPhase = 'set-complete'
    
    const wrapper = mount(SetCompleteView)
    
    expect(wrapper.text()).toContain('Best of 5')
    expect(wrapper.text()).toContain('Games Played: 5')
  })

  it('calls resetMatch when New Match button is clicked', async () => {
    gameStore.players[0].score = 2
    gameStore.players[1].score = 1
    gameStore.currentPhase = 'set-complete'
    
    const wrapper = mount(SetCompleteView)
    
    const newMatchButton = wrapper.find('.button.is-primary')
    await newMatchButton.trigger('click')
    
    expect(gameStore.resetMatch).toHaveBeenCalled()
  })

  it('calls setupMatch with correct parameters when Rematch button is clicked', async () => {
    gameStore.players[0].name = 'Alice'
    gameStore.players[1].name = 'Bob'
    gameStore.players[0].score = 2
    gameStore.players[1].score = 1
    gameStore.matchFormat = 'BO3'
    gameStore.currentPhase = 'set-complete'
    
    const wrapper = mount(SetCompleteView)
    
    const rematchButton = wrapper.find('.button.is-info')
    await rematchButton.trigger('click')
    
    expect(gameStore.setupMatch).toHaveBeenCalledWith({
      player1Name: 'Alice',
      player2Name: 'Bob',
      matchFormat: 'BO3',
      firstBan: 0,
      gentlemansAgreement: false
    })
  })

  it('calculates total bans correctly from game history', () => {
    gameStore.players[0].score = 2
    gameStore.players[1].score = 1
    gameStore.currentPhase = 'set-complete'
    
    // Add game history with different numbers of bans
    gameStore.gameHistory = [
      {
        gameNumber: 1,
        winner: 0,
        selectedStage: 'Battlefield',
        stageBans: [
          { stageId: 'stage1', playerIndex: 0 },
          { stageId: 'stage2', playerIndex: 1 },
          { stageId: 'stage3', playerIndex: 0 },
          { stageId: 'stage4', playerIndex: 1 },
          { stageId: 'stage5', playerIndex: 1 },
          { stageId: 'stage6', playerIndex: 1 },
          { stageId: 'stage7', playerIndex: 0 }
        ]
      },
      {
        gameNumber: 2,
        winner: 1,
        selectedStage: 'Final Destination',
        stageBans: [
          { stageId: 'stage8', playerIndex: 0 },
          { stageId: 'stage9', playerIndex: 0 },
          { stageId: 'stage10', playerIndex: 0 }
        ]
      }
    ]
    
    const wrapper = mount(SetCompleteView)
    
    expect(wrapper.text()).toContain('Total Stage Bans: 10')
  })

  it('has proper button styling classes', () => {
    gameStore.players[0].score = 2
    gameStore.players[1].score = 1
    gameStore.currentPhase = 'set-complete'
    
    const wrapper = mount(SetCompleteView)
    
    const newMatchButton = wrapper.find('.button.is-primary')
    const rematchButton = wrapper.find('.button.is-info')
    
    expect(newMatchButton.classes()).toContain('is-primary')
    expect(rematchButton.classes()).toContain('is-info')
  })

  it('handles empty game history gracefully', () => {
    gameStore.players[0].score = 2
    gameStore.players[1].score = 1
    gameStore.currentGame = 3
    gameStore.currentPhase = 'set-complete'
    gameStore.gameHistory = []
    
    const wrapper = mount(SetCompleteView)
    
    expect(wrapper.text()).toContain('Total Stage Bans: 0')
  })
})
