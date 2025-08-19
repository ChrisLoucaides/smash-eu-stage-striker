import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GentlemansAgreementToggle from '../GentlemansAgreementToggle.vue'
import { useGameStore } from '../../stores/gameStore'

describe('GentlemansAgreementToggle', () => {
  let pinia: any
  let gameStore: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    gameStore = useGameStore()
    
    // Reset store to default state
    gameStore.resetMatch()
    
    // Spy on store methods
    vi.spyOn(gameStore, 'enableGentlemansAgreement')
    vi.spyOn(gameStore, 'disableGentlemansAgreement')
    
    // Mock confirm dialog
    global.confirm = vi.fn()
  })

  it('renders correctly when not enabled', () => {
    gameStore.currentPhase = 'banning'
    gameStore.gentlemansAgreement = false
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    expect(wrapper.text()).toContain("Gentleman's Agreement (Skip Bans)")
    expect(wrapper.find('input[type="checkbox"]').attributes('checked')).toBeUndefined()
    expect(wrapper.find('.agreement-info').exists()).toBe(false)
  })

  it('renders correctly when enabled', () => {
    gameStore.currentPhase = 'selecting'
    gameStore.gentlemansAgreement = true
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    expect(wrapper.find('input[type="checkbox"]').attributes('checked')).toBe('')
    expect(wrapper.find('.agreement-info').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ban sequence bypassed. Select any stage by mutual agreement.')
  })

  it('enables gentleman\'s agreement when checkbox is checked', async () => {
    gameStore.currentPhase = 'banning'
    gameStore.gentlemansAgreement = false
    vi.mocked(global.confirm).mockReturnValue(true)
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    checkbox.element.checked = true
    await checkbox.trigger('change')
    
    expect(gameStore.enableGentlemansAgreement).toHaveBeenCalled()
  })

  it('disables gentleman\'s agreement when checkbox is unchecked', async () => {
    gameStore.currentPhase = 'selecting'
    gameStore.gentlemansAgreement = true
    vi.mocked(global.confirm).mockReturnValue(true)
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    checkbox.element.checked = false
    await checkbox.trigger('change')
    
    expect(gameStore.disableGentlemansAgreement).toHaveBeenCalled()
  })

  it('shows confirmation dialog when enabling', async () => {
    gameStore.currentPhase = 'banning'
    gameStore.gentlemansAgreement = false
    vi.mocked(global.confirm).mockReturnValue(true)
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    checkbox.element.checked = true
    await checkbox.trigger('change')
    
    expect(global.confirm).toHaveBeenCalledWith(
      'Enable Gentleman\'s Agreement? This will clear all current bans and allow direct stage selection.'
    )
  })

  it('shows confirmation dialog when disabling', async () => {
    gameStore.currentPhase = 'selecting'
    gameStore.gentlemansAgreement = true
    vi.mocked(global.confirm).mockReturnValue(true)
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    checkbox.element.checked = false
    await checkbox.trigger('change')
    
    expect(global.confirm).toHaveBeenCalledWith(
      'Disable Gentleman\'s Agreement? This will restart the ban phase.'
    )
  })

  it('resets checkbox when user cancels enabling', async () => {
    gameStore.currentPhase = 'banning'
    gameStore.gentlemansAgreement = false
    vi.mocked(global.confirm).mockReturnValue(false)
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    checkbox.element.checked = true
    await checkbox.trigger('change')
    
    expect(gameStore.enableGentlemansAgreement).not.toHaveBeenCalled()
    expect(checkbox.attributes('checked')).toBeUndefined()
  })

  it('resets checkbox when user cancels disabling', async () => {
    gameStore.currentPhase = 'selecting'
    gameStore.gentlemansAgreement = true
    vi.mocked(global.confirm).mockReturnValue(false)
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    checkbox.element.checked = false
    await checkbox.trigger('change')
    
    expect(gameStore.disableGentlemansAgreement).not.toHaveBeenCalled()
    expect(checkbox.attributes('checked')).toBe('')
  })

  it('is disabled when not in banning or selecting phase', () => {
    gameStore.currentPhase = 'setup'
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.attributes('disabled')).toBe('')
  })

  it('is enabled when in banning phase', () => {
    gameStore.currentPhase = 'banning'
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.attributes('disabled')).toBeUndefined()
  })

  it('is enabled when in selecting phase', () => {
    gameStore.currentPhase = 'selecting'
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.attributes('disabled')).toBeUndefined()
  })

  it('has proper styling classes', () => {
    gameStore.currentPhase = 'banning'
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    expect(wrapper.find('.gentlemans-agreement').exists()).toBe(true)
    expect(wrapper.find('.checkbox').exists()).toBe(true)
    expect(wrapper.find('.checkbox-label').exists()).toBe(true)
  })

  it('shows agreement info when enabled', () => {
    gameStore.currentPhase = 'selecting'
    gameStore.gentlemansAgreement = true
    
    const wrapper = mount(GentlemansAgreementToggle)
    
    expect(wrapper.find('.agreement-info').exists()).toBe(true)
    expect(wrapper.find('.agreement-info p').text()).toBe(
      'Ban sequence bypassed. Select any stage by mutual agreement.'
    )
  })
})
