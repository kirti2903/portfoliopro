import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Portfolio from '../components/Portfolio';
import * as api from '../services/api';

jest.mock('../services/api');

const mockTransactions = [
  {
    id: 1,
    asset_name: 'Apple Inc.',
    transaction_type: 'Buy',
    quantity: 10,
    price: 150,
    transaction_date: '2023-01-15',
    created_at: '2023-01-15T10:00:00.000Z'
  },
  {
    id: 2,
    asset_name: 'Tesla Inc.',
    transaction_type: 'Sell',
    quantity: 5,
    price: 180,
    transaction_date: '2023-02-20',
    created_at: '2023-02-20T14:30:00.000Z'
  }
];

const mockSummary = {
  totalInvestment: '15000.00',
  currentValue: '17500.00',
  totalProfitLoss: '2500.00',
  roi: '16.67'
};

describe('Portfolio Component', () => {
  beforeEach(() => {
    api.transactionAPI.getAll.mockResolvedValue({ data: mockTransactions });
    api.portfolioAPI.getSummary.mockResolvedValue({ data: mockSummary });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders portfolio overview', async () => {
    render(<Portfolio />);
    
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    expect(screen.getByText('Complete transaction history and portfolio summary')).toBeInTheDocument();
  });

  it('displays portfolio summary cards', async () => {
    render(<Portfolio />);
    
    await waitFor(() => {
      expect(screen.getByText('₹15000.00')).toBeInTheDocument();
      expect(screen.getByText('₹17500.00')).toBeInTheDocument();
      expect(screen.getByText('₹2500.00')).toBeInTheDocument();
      expect(screen.getByText('16.67%')).toBeInTheDocument();
    });
  });

  it('displays transaction history table', async () => {
    render(<Portfolio />);
    
    await waitFor(() => {
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
      expect(screen.getByText('Buy')).toBeInTheDocument();
      expect(screen.getByText('Sell')).toBeInTheDocument();
    });
  });

  it('shows correct transaction amounts', async () => {
    render(<Portfolio />);
    
    await waitFor(() => {
      expect(screen.getByText('₹1500.00')).toBeInTheDocument(); // 10 * 150
      expect(screen.getByText('₹900.00')).toBeInTheDocument();  // 5 * 180
    });
  });

  it('displays transaction types with correct styling', async () => {
    render(<Portfolio />);
    
    await waitFor(() => {
      const buyBadge = screen.getByText('Buy');
      const sellBadge = screen.getByText('Sell');
      
      expect(buyBadge).toBeInTheDocument();
      expect(sellBadge).toBeInTheDocument();
    });
  });

  it('handles empty transaction list', async () => {
    api.transactionAPI.getAll.mockResolvedValue({ data: [] });
    
    render(<Portfolio />);
    
    await waitFor(() => {
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    api.transactionAPI.getAll.mockRejectedValue(new Error('API Error'));
    api.portfolioAPI.getSummary.mockRejectedValue(new Error('API Error'));
    
    render(<Portfolio />);
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    render(<Portfolio />);
    
    await waitFor(() => {
      expect(screen.getByText('2023-01-15')).toBeInTheDocument();
      expect(screen.getByText('2023-02-20')).toBeInTheDocument();
    });
  });

  it('calculates total amounts correctly', async () => {
    render(<Portfolio />);
    
    await waitFor(() => {
      // Buy: 10 * 150 = 1500
      // Sell: 5 * 180 = 900
      expect(screen.getByText('₹1500.00')).toBeInTheDocument();
      expect(screen.getByText('₹900.00')).toBeInTheDocument();
    });
  });
});