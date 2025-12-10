import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Tabs from '../Tabs.svelte';

describe('Tabs.svelte', () => {
  const tabs = [
    { value: 'network', label: 'Network' },
    { value: 'response', label: 'Response' },
    { value: 'advanced', label: 'Advanced' }
  ];

  it('should render all tab triggers', () => {
    const { getByText } = render(Tabs, { tabs, value: 'network' });

    expect(getByText('Network')).toBeInTheDocument();
    expect(getByText('Response')).toBeInTheDocument();
    expect(getByText('Advanced')).toBeInTheDocument();
  });

  it('should highlight active tab with GitHub style', () => {
    const { getByText } = render(Tabs, { tabs, value: 'network' });

    const networkTab = getByText('Network').closest('button');
    expect(networkTab).toHaveClass('em-bg-[#F6F8FA]'); // Active background
    expect(networkTab).toHaveClass('em-text-[#1F2328]'); // Active text
  });

  it('should call onChange when clicking inactive tab', async () => {
    const handleChange = vi.fn();
    const { getByText } = render(Tabs, { tabs, value: 'network', onChange: handleChange });

    const responseTab = getByText('Response');
    await fireEvent.click(responseTab);

    expect(handleChange).toHaveBeenCalledWith('response');
  });

  it('should support keyboard navigation (Arrow keys)', async () => {
    const handleChange = vi.fn();
    const { getByText } = render(Tabs, { tabs, value: 'network', onChange: handleChange });

    const networkTab = getByText('Network');
    networkTab.focus();

    // Press ArrowRight to move to next tab
    await fireEvent.keyDown(networkTab, { key: 'ArrowRight' });

    // Should focus Response tab and call onChange
    const responseTab = getByText('Response');
    expect(document.activeElement).toBe(responseTab);
  });

  it('should have proper ARIA attributes', () => {
    const { getByText } = render(Tabs, { tabs, value: 'network' });

    const networkTab = getByText('Network').closest('button');
    expect(networkTab).toHaveAttribute('role', 'tab');
    expect(networkTab).toHaveAttribute('data-state', 'active');

    const responseTab = getByText('Response').closest('button');
    expect(responseTab).toHaveAttribute('data-state', 'inactive');
  });

  it('should render in horizontal layout by default', () => {
    const { container } = render(Tabs, { tabs, value: 'network' });

    const tabList = container.querySelector('[role="tablist"]');
    expect(tabList).toHaveClass('em-flex');
    expect(tabList).toHaveClass('em-gap-1');
  });
});
