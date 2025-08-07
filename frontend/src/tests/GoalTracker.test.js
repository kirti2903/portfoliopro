import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoalTracker from '../components/GoalTracker';
import * as api from '../services/api';

jest.mock('../services/api');

const mockGoals = [
  {
    id: 1,
    goal_name: 'Retirement Fund',
    target_amount: 1000000,
    current_amount: 250000,
    target_date: '2030-12-31'
  },
  {
    id: 2,
    goal_name: 'House Down Payment',
    target_amount: 500000,
    current_amount: 100000,
    target_date: '2025-06-30'
  }
];

describe('GoalTracker Component', () => {
  beforeEach(() => {
    api.goalAPI.getAll.mockResolvedValue({ data: mockGoals });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders goal tracker page', async () => {
    render(<GoalTracker />);
    
    expect(screen.getByText('Goal Tracker')).toBeInTheDocument();
    expect(screen.getByText('Track your financial goals')).toBeInTheDocument();
  });

  it('displays goals with progress', async () => {
    render(<GoalTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('Retirement Fund')).toBeInTheDocument();
      expect(screen.getByText('House Down Payment')).toBeInTheDocument();
      expect(screen.getByText('₹250,000')).toBeInTheDocument();
      expect(screen.getByText('₹1,000,000')).toBeInTheDocument();
    });
  });

  it('shows progress percentages', async () => {
    render(<GoalTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('25%')).toBeInTheDocument(); // 250000/1000000
      expect(screen.getByText('20%')).toBeInTheDocument(); // 100000/500000
    });
  });

  it('handles goal creation', async () => {
    api.goalAPI.create.mockResolvedValue({ data: { id: 3 } });
    
    render(<GoalTracker />);
    
    fireEvent.click(screen.getByText('+ Add Goal'));
    
    fireEvent.change(screen.getByPlaceholderText('Goal Name'), {
      target: { value: 'Emergency Fund' }
    });
    fireEvent.change(screen.getByPlaceholderText('Target Amount'), {
      target: { value: '300000' }
    });
    
    fireEvent.click(screen.getByText('Create Goal'));
    
    await waitFor(() => {
      expect(api.goalAPI.create).toHaveBeenCalledWith({
        goal_name: 'Emergency Fund',
        target_amount: '300000',
        current_amount: 0,
        target_date: expect.any(String)
      });
    });
  });

  it('updates goal progress', async () => {
    api.goalAPI.updateProgress.mockResolvedValue({ data: { message: 'Updated' } });
    
    render(<GoalTracker />);
    
    await waitFor(() => {
      const updateButtons = screen.getAllByText('Update Progress');
      fireEvent.click(updateButtons[0]);
    });
    
    fireEvent.change(screen.getByPlaceholderText('Current Amount'), {
      target: { value: '300000' }
    });
    
    fireEvent.click(screen.getByText('Update'));
    
    await waitFor(() => {
      expect(api.goalAPI.updateProgress).toHaveBeenCalledWith(1, {
        current_amount: '300000'
      });
    });
  });

  it('deletes goals', async () => {
    api.goalAPI.delete.mockResolvedValue({ data: { message: 'Deleted' } });
    
    render(<GoalTracker />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
    });
    
    fireEvent.click(screen.getByText('Yes, Delete'));
    
    await waitFor(() => {
      expect(api.goalAPI.delete).toHaveBeenCalledWith(1);
    });
  });

  it('shows goal completion status', async () => {
    const completedGoal = {
      id: 3,
      goal_name: 'Completed Goal',
      target_amount: 100000,
      current_amount: 100000,
      target_date: '2023-12-31'
    };
    
    api.goalAPI.getAll.mockResolvedValue({ data: [completedGoal] });
    
    render(<GoalTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Completed!')).toBeInTheDocument();
    });
  });
});