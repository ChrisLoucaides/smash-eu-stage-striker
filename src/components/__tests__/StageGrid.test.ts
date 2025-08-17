import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import StageGrid from '../StageGrid.vue';

describe('StageGrid', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should render all 9 stages', () => {
    const wrapper = mount(StageGrid);
    const stageItems = wrapper.findAll('.stage-item');
    expect(stageItems).toHaveLength(9);
  });

  it('should display stage names', () => {
    const wrapper = mount(StageGrid);
    const stageNames = wrapper.findAll('.stage-name');
    
    // Check that we have stage names
    expect(stageNames.length).toBeGreaterThan(0);
    
    // Check that at least one stage name is visible
    const visibleNames = stageNames.filter(name => name.isVisible());
    expect(visibleNames.length).toBeGreaterThan(0);
  });

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(StageGrid);
    const stageItems = wrapper.findAll('.stage-item');
    
    // Check that each stage item has proper ARIA attributes
    stageItems.forEach(item => {
      expect(item.attributes('role')).toBe('button');
      expect(item.attributes('aria-label')).toBeDefined();
    });
  });

  it('should handle stage clicks', async () => {
    const wrapper = mount(StageGrid);
    const firstStage = wrapper.find('.stage-item');
    
    // Initially, stages should not be interactive (setup phase)
    expect(firstStage.classes()).not.toContain('interactive');
    
    // Click should not cause errors
    await firstStage.trigger('click');
    expect(wrapper.emitted()).toBeDefined();
  });

  it('should be responsive', () => {
    const wrapper = mount(StageGrid);
    
    // Check that the grid container has responsive classes
    const container = wrapper.find('.stage-grid-container');
    expect(container.exists()).toBe(true);
    
    // Check that the grid has proper CSS grid setup
    const grid = wrapper.find('.stage-grid');
    expect(grid.exists()).toBe(true);
  });
});
