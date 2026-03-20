// src/__tests__/components/BlindCountBoard.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BlindCountBoard from '../../components/BlindCountBoard';

// Mock the API calls so we don't actually hit the backend during UI tests
global.fetch = jest.fn();

const MOCK_COUNT_SHEET = {
  items: [{ sku: 'POST-VINYL-5X5', name: '5x5 Vinyl Post', category: 'Vinyl Hardware' }],
  categories: [
    {
      name: 'Vinyl Hardware',
      items: [{ sku: 'POST-VINYL-5X5', name: '5x5 Vinyl Post' }]
    }
  ]
};

const MOCK_DAILY_ASSIGNMENT = {
  assigned: true,
  dayName: 'Wednesday',
  category: 'Vinyl Hardware',
  categories: ['Vinyl Hardware'],
  weekNumber: 12,
  message: 'Alright crew, Wednesday count: Vinyl Hardware. Let me know when you\'re done.',
  weekSchedule: [
    { day: 'Monday', categories: ['Aluminum Hardware'] },
    { day: 'Tuesday', categories: ['Chain Link - Black'] },
    { day: 'Wednesday', categories: ['Vinyl Hardware'] },
    { day: 'Thursday', categories: ['Shop Consumables'] },
    { day: 'Friday', categories: ['Vinyl Linears'] },
  ]
};

describe('Task Contract: Blind Count UI Board', () => {

  beforeEach(() => {
    fetch.mockClear();
  });

  // Helper to mock the two initial fetches (count-sheet + daily-assignment)
  const mockInitialFetches = () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_COUNT_SHEET })
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_DAILY_ASSIGNMENT });
  };

  it('CONTRACT: Renders the count sheet without showing any quantities', async () => {
    mockInitialFetches();
    render(<BlindCountBoard />);

    // Category selector should show the category name
    const categoryBtn = await screen.findByText('Vinyl Hardware');
    expect(categoryBtn).toBeInTheDocument();

    // Click into the category to see items
    fireEvent.click(categoryBtn);

    // The Law: It must show the item name, but no "on-hand" numbers
    expect(await screen.findByText('5x5 Vinyl Post')).toBeInTheDocument();
    expect(screen.getByText('POST-VINYL-5X5')).toBeInTheDocument();

    // Ensure no "on hand" label sneaked in
    const onHandText = screen.queryByText(/on hand/i);
    expect(onHandText).not.toBeInTheDocument();
  });

  it('CONTRACT: Allows the crew to input an absolute count and submit', async () => {
    mockInitialFetches();
    render(<BlindCountBoard counterName="Big Bob" />);

    // Click into the category
    const categoryBtn = await screen.findByText('Vinyl Hardware');
    fireEvent.click(categoryBtn);

    // Wait for the item to load
    const inputField = await screen.findByPlaceholderText('Enter physical count');
    const submitBtn = screen.getByRole('button', { name: /submit count/i });

    // 1. Crew types '48' into the box
    fireEvent.change(inputField, { target: { value: '48' } });

    // 2. Mock the successful reconciliation response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Count reconciled', variance: -2 })
    });

    // 3. Crew hits submit
    fireEvent.click(submitBtn);

    // 4. The Law: It must send the correct payload to the correct endpoint
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/inventory/reconcile', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          sku: 'POST-VINYL-5X5',
          actualCount: 48,
          counterName: 'Big Bob'
        })
      }));
    });

    // 5. Variance should NOT show during counting — only in the Finish Day report
    expect(screen.queryByText(/Variance:/)).not.toBeInTheDocument();
  });
});
