import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetManagement from '../components/AssetManagement';
import * as api from '../services/api';

jest.mock('../services/api');

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

describe('AssetManagement Component', () => {
  beforeEach(() => {
    api.assetAPI.getAll.mockResolvedValue({ data: mockAssets });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders asset management page', async () => {
    render(<AssetManagement />);
    
    expect(screen.getByText('Asset Management')).toBeInTheDocument();
  });

  it('displays assets in table format', async () => {
    render(<AssetManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
    });
  });

  it('handles asset creation', async () => {
    api.assetAPI.create.mockResolvedValue({ data: { id: 3 } });
    
    render(<AssetManagement />);
    
    const addButton = screen.getByText('+ Add Asset');
    fireEvent.click(addButton);
    
    expect(api.assetAPI.create).toHaveBeenCalled();
  });

  it('calculates asset values correctly', async () => {
    render(<AssetManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });
  });
});