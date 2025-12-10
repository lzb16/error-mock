import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Switch from '../Switch.svelte';

describe('Switch.svelte', () => {
  it('should render with label', () => {
    const { getByText } = render(Switch, { label: 'Enable', checked: false });

    expect(getByText('Enable')).toBeInTheDocument();
  });

  it('should show checked state with green background', () => {
    const { container } = render(Switch, { label: 'Enable', checked: true });

    const track = container.querySelector('.em-relative.em-h-5.em-w-9');
    expect(track).toHaveClass('peer-checked:em-bg-[#1F883D]'); // GitHub green
  });

  it('should show unchecked state with gray background', () => {
    const { container } = render(Switch, { label: 'Enable', checked: false });

    const track = container.querySelector('.em-relative.em-h-5.em-w-9');
    expect(track).toHaveClass('em-bg-[#D0D7DE]'); // GitHub border gray
  });

  it('should call onChange when clicked', async () => {
    const handleChange = vi.fn();
    const { getByRole } = render(Switch, {
      label: 'Enable',
      checked: false,
      onChange: handleChange
    });

    const checkbox = getByRole('checkbox', { hidden: true });
    await fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should toggle thumb position when checked', () => {
    const { container } = render(Switch, { label: 'Enable', checked: true });

    // The thumb should have the translate class (it's a CSS class that applies when peer is checked)
    const thumb = container.querySelector('.em-absolute.em-left-\\[2px\\]');
    expect(thumb).toHaveClass('peer-checked:em-translate-x-4');

    // The track should have the green background class
    expect(thumb?.parentElement).toHaveClass('peer-checked:em-bg-[#1F883D]');
  });

  it('should support disabled state', () => {
    const { getByRole } = render(Switch, {
      label: 'Enable',
      checked: false,
      disabled: true
    });

    const checkbox = getByRole('checkbox', { hidden: true });
    expect(checkbox).toBeDisabled();
  });

  it('should have proper ARIA attributes', () => {
    const { getByRole } = render(Switch, { label: 'Enable', checked: true });

    const checkbox = getByRole('checkbox', { hidden: true });
    // Melt UI handles checkbox state through standard checked attribute
    expect(checkbox).toBeChecked();
  });

  it('should update disabled state reactively after mount', async () => {
    const { component, getByRole } = render(Switch, {
      label: 'Enable',
      checked: false,
      disabled: false
    });

    const checkbox = getByRole('checkbox', { hidden: true });

    // Initially enabled
    expect(checkbox).not.toBeDisabled();

    // Update disabled prop
    await component.$set({ disabled: true });

    // Should now be disabled
    expect(checkbox).toBeDisabled();

    // Toggle back to enabled
    await component.$set({ disabled: false });

    // Should be enabled again
    expect(checkbox).not.toBeDisabled();
  });
});
