import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Header from '../Header.svelte';

describe('Modal Header', () => {
  it('renders app title', () => {
    render(Header, {
      props: {
        currentApi: null,
        isBatchMode: false,
        selectedCount: 0
      }
    });

    expect(screen.getByText('Error Mock')).toBeInTheDocument();
  });

  it('displays API context in single mode', () => {
    render(Header, {
      props: {
        currentApi: { method: 'POST', url: '/api/user/login' },
        isBatchMode: false,
        selectedCount: 0
      }
    });

    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('/api/user/login')).toBeInTheDocument();
  });

  it('displays batch context in batch mode', () => {
    render(Header, {
      props: {
        currentApi: null,
        isBatchMode: true,
        selectedCount: 3
      }
    });

    expect(screen.getByText(/Batch Editing/)).toBeInTheDocument();
    expect(screen.getByText(/3 items/)).toBeInTheDocument();
  });

  it('emits minimize event when minimize button clicked', async () => {
    const user = userEvent.setup();
    const { component } = render(Header, {
      props: {
        currentApi: null,
        isBatchMode: false,
        selectedCount: 0
      }
    });

    const mockHandler = vi.fn();
    component.$on('minimize', mockHandler);

    const minimizeBtn = screen.getByLabelText('Minimize');
    await user.click(minimizeBtn);

    expect(mockHandler).toHaveBeenCalled();
  });

  it('emits close event when close button clicked', async () => {
    const user = userEvent.setup();
    const { component } = render(Header, {
      props: {
        currentApi: null,
        isBatchMode: false,
        selectedCount: 0
      }
    });

    const mockHandler = vi.fn();
    component.$on('close', mockHandler);

    const closeBtn = screen.getByLabelText('Close');
    await user.click(closeBtn);

    expect(mockHandler).toHaveBeenCalled();
  });

  it('displays correct HTTP method colors', () => {
    const { unmount } = render(Header, {
      props: {
        currentApi: { method: 'POST', url: '/api/test' },
        isBatchMode: false,
        selectedCount: 0
      }
    });

    const postMethod = screen.getByText('POST');
    expect(postMethod).toHaveStyle({ color: 'rgb(31, 136, 61)' }); // GitHub Green

    unmount();

    render(Header, {
      props: {
        currentApi: { method: 'GET', url: '/api/test' },
        isBatchMode: false,
        selectedCount: 0
      }
    });

    const getMethod = screen.getByText('GET');
    expect(getMethod).toHaveStyle({ color: 'rgb(9, 105, 218)' }); // GitHub Blue
  });

  it('truncates long API URLs', () => {
    const longUrl = '/api/very/long/path/that/should/be/truncated/in/display';
    render(Header, {
      props: {
        currentApi: { method: 'GET', url: longUrl },
        isBatchMode: false,
        selectedCount: 0
      }
    });

    const urlElement = screen.getByText(longUrl);
    expect(urlElement).toHaveClass('em-truncate');
    expect(urlElement).toHaveAttribute('title', longUrl);
  });

  it('does not display API context in batch mode', () => {
    render(Header, {
      props: {
        currentApi: { method: 'POST', url: '/api/user/login' },
        isBatchMode: true,
        selectedCount: 5
      }
    });

    // In batch mode, API context should not be displayed
    expect(screen.queryByText('POST')).not.toBeInTheDocument();
    expect(screen.queryByText('/api/user/login')).not.toBeInTheDocument();

    // Only batch context should be visible
    expect(screen.getByText(/Batch Editing/)).toBeInTheDocument();
  });

  it('handles unknown HTTP methods with default color', () => {
    render(Header, {
      props: {
        currentApi: { method: 'CUSTOM', url: '/api/test' },
        isBatchMode: false,
        selectedCount: 0
      }
    });

    const customMethod = screen.getByText('CUSTOM');
    expect(customMethod).toHaveStyle({ color: 'rgb(101, 109, 118)' }); // Default gray
  });
});
