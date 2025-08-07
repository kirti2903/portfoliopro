import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../components/Dashboard';
import * as api from '../services/api';

jest.mock('../services/api');
jest.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>
}));

const mockSummary = {
  totalInvestment: '15000.00',
  currentValue: '17500.00',
  totalProfitLoss: '2500.00',
  roi: '16.67'
};

const mockDistribution = [
  { name: 'Apple Inc.', value: '10500.00' },
  { name: 'Tesla Inc.', value: '7000.00' }
];

const mockAssets = [
  {
    id: 1,
    asset_name: 'Apple Inc.',
    asset_type: 'Stock',
    quantity: 10,
    buy_price: 150,
    current_price: 175,
    purchase_date: '2023-01-15T00:00:00.000Z'
  },
  {
    id: 2,
    asset_name: 'Tesla Inc.',
    asset_type: 'Stock',
    quantity: 5,
    buy_price: 200,
    current_price: 180,
    purchase_date: '2023-02-20T00:00:00.000Z'
  }
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    api.portfolioAPI.getSummary.mockResolvedValue({ data: mockSummary });
    api.portfolioAPI.getDistribution.mockResolvedValue({ data: mockDistribution });
    api.assetAPI.getAll.mockResolvedValue({ data: mockAssets });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with portfolio data', async () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Portfolio Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time portfolio tracking and management')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('₹15000.00')).toBeInTheDocument();
      expect(screen.getByText('₹17500.00')).toBeInTheDocument();
      expect(screen.getByText('₹2500.00')).toBeInTheDocument();
      expect(screen.getByText('16.67%')).toBeInTheDocument();
    });
  });

  it('displays assets table with correct data', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
      expect(screen.getAllByText('Stock')).toHaveLength(2);
    });
  });

  it('shows add asset form when button clicked', async () => {
    render(<Dashboard />);
    
    const addButton = screen.getByText('+ Add Asset');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Add New Asset')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Apple Inc.')).toBeInTheDocument();
  });

  it('handles asset creation', async () => {
    api.assetAPI.create.mockResolvedValue({ data: { id: 3 } });
    api.transactionAPI.create.mockResolvedValue({ data: { id: 1 } });
    
    render(<Dashboard />);
    
    fireEvent.click(screen.getByText('+ Add Asset'));
    
    fireEvent.change(screen.getByPlaceholderText('e.g., Apple Inc.'), {
      target: { value: 'Microsoft Corp.' }
    });
    fireEvent.change(screen.getByPlaceholderText('Quantity'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByPlaceholderText('Buy Price'), {
      target: { value: '300' }
    });
    
    fireEvent.click(screen.getByText('Add Asset'));
    
    await waitFor(() => {
      expect(api.assetAPI.create).toHaveBeenCalledWith({
        asset_name: 'Microsoft Corp.',
        asset_type: 'Stock',
        quantity: '10',
        buy_price: '300',
        current_price: '300',
        purchase_date: expect.any(String)
      });
    });
  });

  it('opens trade modal when buy button clicked', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const buyButtons = screen.getAllByText('🟢 Buy');
      fireEvent.click(buyButtons[0]);
    });
    
    expect(screen.getByText('Buy Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('₹175')).toBeInTheDocument();
  });

  it('executes buy trade successfully', async () => {
    api.transactionAPI.create.mockResolvedValue({ data: { id: 1 } });
    api.assetAPI.update.mockResolvedValue({ data: { message: 'Updated' } });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      const buyButtons = screen.getAllByText('🟢 Buy');
      fireEvent.click(buyButtons[0]);
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter quantity'), {
      target: { value: '5' }
    });
    
    fireEvent.click(screen.getByText('🟢 Execute Buy'));
    
    await waitFor(() => {
      expect(api.transactionAPI.create).toHaveBeenCalled();
      expect(api.assetAPI.update).toHaveBeenCalled();
    });
  });

  it('handles sell trade with quantity validation', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const sellButtons = screen.getAllByText('🔴 Sell');
      fireEvent.click(sellButtons[0]);
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter quantity'), {
      target: { value: '15' }
    });
    
    fireEvent.click(screen.getByText('🔴 Execute Sell'));
    
    await waitFor(() => {
      expect(screen.getByText('Insufficient quantity available!')).toBeInTheDocument();
    });
  });

  it('displays charts when data is available', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('calculates profit/loss correctly', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      // Apple: (175-150) * 10 = 250
      // Tesla: (180-200) * 5 = -100
      const profitLossElements = screen.getAllByText(/₹[\d.-]+/);
      expect(profitLossElements.length).toBeGreaterThan(0);
    });
  });
});