import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketTrends from '../components/MarketTrends';

jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="market-chart">Market Chart</div>,
  Bar: () => <div data-testid="sector-chart">Sector Chart</div>
}));

describe('MarketTrends Component', () => {
  it('renders market trends page', () => {
    render(<MarketTrends />);
    
    expect(screen.getByText('Market Trends')).toBeInTheDocument();
    expect(screen.getByText('Live market data and analysis')).toBeInTheDocument();
  });

  it('displays market indices', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByText('NIFTY 50')).toBeInTheDocument();
      expect(screen.getByText('SENSEX')).toBeInTheDocument();
    });
  });

  it('shows top gainers and losers', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByText('Top Gainers')).toBeInTheDocument();
      expect(screen.getByText('Top Losers')).toBeInTheDocument();
    });
  });

  it('displays market charts', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByTestId('market-chart')).toBeInTheDocument();
      expect(screen.getByTestId('sector-chart')).toBeInTheDocument();
    });
  });

  it('shows financial news section', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByText('Financial News')).toBeInTheDocument();
    });
  });

  it('displays sector performance', async () => {
    render(<MarketTrends />);
    
    await waitFor(() => {
      expect(screen.getByText('Sector Performance')).toBeInTheDocument();
    });
  });
});