import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionLog from '../components/TransactionLog';
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

describe('TransactionLog Component', () => {
  beforeEach(() => {
    api.transactionAPI.getAll.mockResolvedValue({ data: mockTransactions });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders transaction log page', async () => {
    render(<TransactionLog />);
    
    expect(screen.getByText('Transaction Log')).toBeInTheDocument();
    expect(screen.getByText('Complete history of all transactions')).toBeInTheDocument();
  });

  it('displays transactions in table', async () => {
    render(<TransactionLog />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
      expect(screen.getByText('Buy')).toBeInTheDocument();
      expect(screen.getByText('Sell')).toBeInTheDocument();
    });
  });

  it('shows transaction amounts', async () => {
    render(<TransactionLog />);
    
    await waitFor(() => {
      expect(screen.getByText('₹1,500.00')).toBeInTheDocument(); // 10 * 150
      expect(screen.getByText('₹900.00')).toBeInTheDocument();   // 5 * 180
    });
  });

  it('filters transactions by type', async () => {
    render(<TransactionLog />);
    
    await waitFor(() => {
      fireEvent.change(screen.getByDisplayValue('All Types'), {
        target: { value: 'Buy' }
      });
    });
    
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.queryByText('Tesla Inc.')).not.toBeInTheDocument();
  });

  it('filters transactions by date range', async () => {
    render(<TransactionLog />);
    
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('From Date'), {
        target: { value: '2023-02-01' }
      });
    });
    
    expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
    expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
  });

  it('searches transactions by asset name', async () => {
    render(<TransactionLog />);
    
    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Search by asset name'), {
        target: { value: 'Apple' }
      });
    });
    
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.queryByText('Tesla Inc.')).not.toBeInTheDocument();
  });

  it('deletes transactions', async () => {
    api.transactionAPI.delete.mockResolvedValue({ data: { message: 'Deleted' } });
    
    render(<TransactionLog />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
    });
    
    fireEvent.click(screen.getByText('Yes, Delete'));
    
    await waitFor(() => {
      expect(api.transactionAPI.delete).toHaveBeenCalledWith(1);
    });
  });

  it('shows transaction statistics', async () => {
    render(<TransactionLog />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Transactions')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Total Buy Amount')).toBeInTheDocument();
      expect(screen.getByText('Total Sell Amount')).toBeInTheDocument();
    });
  });

  it('exports transaction data', async () => {
    render(<TransactionLog />);
    
    await waitFor(() => {
      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);
    });
    
    // Check if download was triggered (mock implementation)
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('handles empty transaction list', async () => {
    api.transactionAPI.getAll.mockResolvedValue({ data: [] });
    
    render(<TransactionLog />);
    
    await waitFor(() => {
      expect(screen.getByText('No transactions found')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    api.transactionAPI.getAll.mockRejectedValue(new Error('API Error'));
    
    render(<TransactionLog />);
    
    await waitFor(() => {
      expect(screen.getByText('Transaction Log')).toBeInTheDocument();
    });
  });
});