import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GameModal from '../GameModal.vue'
import { useGameStore } from '../../stores/gameStore'

describe('GameModal', () => {
  let pinia: any
  let gameStore: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    gameStore = useGameStore()
    
    // Reset store to default state
    gameStore.resetMatch()
    
    // Spy on store methods
    vi.spyOn(gameStore, 'declareWinner')
  })

  it('renders correctly when open', () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    expect(wrapper.text()).toContain('Game 1 Result')
    expect(wrapper.text()).toContain('Select Winner:')
    expect(wrapper.text()).toContain('Player 1')
    expect(wrapper.text()).toContain('Player 2')
  })

  it('does not render when closed', () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: false
      }
    })
    
    expect(wrapper.find('.modal-content').exists()).toBe(false)
  })

  it('displays selected stage when available', async () => {
    // Set a selected stage
    gameStore.selectedStage = 'Battlefield'
    
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    expect(wrapper.text()).toContain('Stage: Battlefield')
  })

  it('calls declareWinner when player 1 wins', async () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    const player1Button = wrapper.findAll('.button.is-primary')[0]
    await player1Button.trigger('click')
    
    expect(gameStore.declareWinner).toHaveBeenCalledWith(0)
  })

  it('calls declareWinner when player 2 wins', async () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    const player2Button = wrapper.findAll('.button.is-info')[0]
    await player2Button.trigger('click')
    
    expect(gameStore.declareWinner).toHaveBeenCalledWith(1)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    const closeButton = wrapper.find('.modal-close')
    await closeButton.trigger('click')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when background is clicked', async () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    const background = wrapper.find('.modal-background')
    await background.trigger('click')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event after winner confirmation', async () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    const player1Button = wrapper.findAll('.button.is-primary')[0]
    await player1Button.trigger('click')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('displays correct game number', async () => {
    // Change game number
    gameStore.currentGame = 3
    
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    expect(wrapper.text()).toContain('Game 3 Result')
  })

  it('displays player names correctly', async () => {
    // Change player names
    gameStore.updatePlayerName(0, 'Alice')
    gameStore.updatePlayerName(1, 'Bob')
    
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })

  it('has proper button styling classes', () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    const player1Button = wrapper.findAll('.button.is-primary')[0]
    const player2Button = wrapper.findAll('.button.is-info')[0]
    
    expect(player1Button.classes()).toContain('is-primary')
    expect(player2Button.classes()).toContain('is-info')
  })

  it('has proper modal structure', () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    expect(wrapper.find('.modal-background').exists()).toBe(true)
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.find('.modal-close').exists()).toBe(true)
  })

  it('properly handles re-opening after close', async () => {
    const wrapper = mount(GameModal, {
      props: {
        isOpen: true
      }
    })
    
    // Close modal via background click
    const background = wrapper.find('.modal-background')
    await background.trigger('click')
    
    expect(wrapper.emitted('close')).toBeTruthy()
    
    // Modal should be able to be re-opened
    await wrapper.setProps({ isOpen: false })
    expect(wrapper.find('.modal-content').exists()).toBe(false)
    
    await wrapper.setProps({ isOpen: true })
    expect(wrapper.find('.modal-content').exists()).toBe(true)
  })
})
