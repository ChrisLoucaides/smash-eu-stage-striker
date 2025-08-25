import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SetupModal from '../SetupModal.vue'

describe('SetupModal', () => {
  // @ts-ignore
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly when open', () => {
    const wrapper = mount(SetupModal, {
      props: {
        isOpen: true
      }
    })

    expect(wrapper.find('.modal').classes()).toContain('is-active')
    expect(wrapper.find('.title').text()).toBe('Match Setup')
    expect(wrapper.find('input[type="text"]')).toBeTruthy()
    expect(wrapper.find('input[type="radio"]')).toBeTruthy()
    expect(wrapper.find('input[type="checkbox"]')).toBeTruthy()
  })

  it('does not render when closed', () => {
    const wrapper = mount(SetupModal, {
      props: {
        isOpen: false
      }
    })

    expect(wrapper.find('.modal').classes()).not.toContain('is-active')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(SetupModal, {
      props: {
        isOpen: true
      }
    })

    await wrapper.find('.modal-close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when background is clicked', async () => {
    const wrapper = mount(SetupModal, {
      props: {
        isOpen: true
      }
    })

    await wrapper.find('.modal-background').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('validates player names are different', async () => {
    const wrapper = mount(SetupModal, {
      props: {
        isOpen: true
      }
    })

    const player1Input = wrapper.find('input[placeholder="Enter Player 1 name"]')
    const player2Input = wrapper.find('input[placeholder="Enter Player 2 name"]')

    // Set same names
    await player1Input.setValue('Player')
    await player2Input.setValue('Player')

    // Check for error message
    expect(wrapper.find('.help.is-danger').text()).toBe('Player names must be different')
    
    // Check that submit button is disabled
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('enables submit button when form is valid', async () => {
    const wrapper = mount(SetupModal, {
      props: {
        isOpen: true
      }
    })

    const player1Input = wrapper.find('input[placeholder="Enter Player 1 name"]')
    const player2Input = wrapper.find('input[placeholder="Enter Player 2 name"]')

    // Set different names
    await player1Input.setValue('Player 1')
    await player2Input.setValue('Player 2')

    // Check that submit button is enabled
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })
})
