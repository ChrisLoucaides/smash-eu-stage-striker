import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ScoreBoard from '../ScoreBoard.vue'
import { useGameStore } from '../../stores/gameStore'

// Mock confirm dialog
global.confirm = vi.fn()

describe('ScoreBoard', () => {
  let pinia: any
  let gameStore: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    gameStore = useGameStore()
    
    // Reset store to default state by calling resetMatch
    gameStore.resetMatch()
    
    // Mock confirm to return true by default
    vi.mocked(global.confirm).mockReturnValue(true)
    
    // Spy on store methods
    vi.spyOn(gameStore, 'updatePlayerScore')
    vi.spyOn(gameStore, 'updatePlayerName')
  })

  it('renders player names and scores correctly', () => {
    const wrapper = mount(ScoreBoard)
    
    expect(wrapper.text()).toContain('Player 1')
    expect(wrapper.text()).toContain('Player 2')
    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('Game 1')
    expect(wrapper.text()).toContain('Best of 3')
  })

  it('displays correct match format for BO5', async () => {
    gameStore.matchFormat = 'BO5'
    const wrapper = mount(ScoreBoard)
    
    expect(wrapper.text()).toContain('Best of 5')
  })

  it('increases score when increase button is clicked', async () => {
    const wrapper = mount(ScoreBoard)
    const increaseButton = wrapper.findAll('.score-btn.increase')[0]
    
    await increaseButton.trigger('click')
    
    expect(gameStore.updatePlayerScore).toHaveBeenCalledWith(0, 1)
  })

  it('decreases score when decrease button is clicked', async () => {
    // Set initial score to 1
    gameStore.updatePlayerScore(0, 1)
    
    const wrapper = mount(ScoreBoard)
    const decreaseButton = wrapper.findAll('.score-btn.decrease')[0]
    
    await decreaseButton.trigger('click')
    
    expect(gameStore.updatePlayerScore).toHaveBeenCalledWith(0, 0)
  })

  it('shows confirmation dialog for score changes', async () => {
    const wrapper = mount(ScoreBoard)
    const increaseButton = wrapper.findAll('.score-btn.increase')[0]
    
    await increaseButton.trigger('click')
    
    expect(global.confirm).toHaveBeenCalledWith('Increase Player 1\'s score?')
  })

  it('does not increase score when confirmation is cancelled', async () => {
    vi.mocked(global.confirm).mockReturnValue(false)
    
    const wrapper = mount(ScoreBoard)
    const increaseButton = wrapper.findAll('.score-btn.increase')[0]
    
    await increaseButton.trigger('click')
    
    expect(gameStore.updatePlayerScore).not.toHaveBeenCalled()
  })

  it('disables increase button when max score is reached for BO3', () => {
    gameStore.updatePlayerScore(0, 2) // Max score for BO3
    
    const wrapper = mount(ScoreBoard)
    const increaseButton = wrapper.findAll('.score-btn.increase')[0]
    
    expect(increaseButton.attributes('disabled')).toBeDefined()
  })

  it('disables increase button when max score is reached for BO5', () => {
    gameStore.matchFormat = 'BO5'
    gameStore.updatePlayerScore(0, 3) // Max score for BO5
    
    const wrapper = mount(ScoreBoard)
    const increaseButton = wrapper.findAll('.score-btn.increase')[0]
    
    expect(increaseButton.attributes('disabled')).toBeDefined()
  })

  it('disables decrease button when score is 0', () => {
    const wrapper = mount(ScoreBoard)
    const decreaseButton = wrapper.findAll('.score-btn.decrease')[0]
    
    expect(decreaseButton.attributes('disabled')).toBeDefined()
  })

  it('highlights active player during banning phase', async () => {
    // Setup a match to get into banning phase
    gameStore.setupMatch({
      player1Name: 'Player 1',
      player2Name: 'Player 2',
      matchFormat: 'BO3',
      firstBan: 0,
      gentlemansAgreement: false
    })
    
    const wrapper = mount(ScoreBoard)
    
    // First player should be active
    const playerScore = wrapper.findAll('.player-score')[0]
    expect(playerScore.classes()).toContain('is-active')
  })

  it('updates display when player names change', async () => {
    gameStore.updatePlayerName(0, 'Alice')
    gameStore.updatePlayerName(1, 'Bob')
    
    const wrapper = mount(ScoreBoard)
    
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })

  it('updates display when scores change', async () => {
    gameStore.updatePlayerScore(0, 1)
    gameStore.updatePlayerScore(1, 2)
    
    const wrapper = mount(ScoreBoard)
    
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('2')
  })

  it('updates display when game number changes', async () => {
    gameStore.currentGame = 3
    
    const wrapper = mount(ScoreBoard)
    
    expect(wrapper.text()).toContain('Game 3')
  })

  it('has proper ARIA labels for accessibility', () => {
    const wrapper = mount(ScoreBoard)
    
    const decreaseButtons = wrapper.findAll('.score-btn.decrease')
    const increaseButtons = wrapper.findAll('.score-btn.increase')
    
    expect(decreaseButtons[0].attributes('aria-label')).toBe('Decrease score for Player 1')
    expect(decreaseButtons[1].attributes('aria-label')).toBe('Decrease score for Player 2')
    expect(increaseButtons[0].attributes('aria-label')).toBe('Increase score for Player 1')
    expect(increaseButtons[1].attributes('aria-label')).toBe('Increase score for Player 2')
  })
})
