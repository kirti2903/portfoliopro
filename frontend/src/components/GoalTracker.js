import React, { useState, useEffect } from 'react';
import { goalAPI, portfolioAPI } from '../services/api';

const GoalTracker = () => {
  const [goals, setGoals] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    target_date: ''
  });

  useEffect(() => {
    fetchGoals();
    fetchPortfolioValue();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalAPI.getAll();
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchPortfolioValue = async () => {
    try {
      const response = await portfolioAPI.getSummary();
      setPortfolioValue(parseFloat(response.data.currentValue));
    } catch (error) {
      console.error('Error fetching portfolio value:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await goalAPI.create(formData);
      fetchGoals();
      resetForm();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalAPI.delete(id);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      goal_name: '',
      target_amount: '',
      target_date: ''
    });
    setShowForm(false);
  };

  const getProgressPercentage = (targetAmount) => {
    return Math.min((portfolioValue / targetAmount) * 100, 100);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            Goal Tracker
          </h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#3B82F6',
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {showForm ? 'Cancel' : '+ Add Goal'}
          </button>
        </div>

        {/* Portfolio Value Card */}
        <div style={{ 
          marginBottom: '32px', 
          padding: '24px', 
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #E2E8F0',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Current Portfolio Value</h3>
          <p style={{ fontSize: '32px', margin: 0, fontWeight: '700', color: '#3B82F6' }}>₹{portfolioValue.toFixed(2)}</p>
        </div>

        {/* Add Goal Form */}
        {showForm && (
          <div style={{ 
            marginBottom: '32px', 
            padding: '24px', 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>Add New Goal</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Goal Name</label>
                  <input
                    type="text"
                    placeholder="Goal Name"
                    value={formData.goal_name}
                    onChange={(e) => setFormData({...formData, goal_name: e.target.value})}
                    required
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Target Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Target Amount"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    required
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Target Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  />
                </div>
              </div>
              <button 
                type="submit"
                style={{ 
                  marginTop: '20px', 
                  padding: '10px 20px', 
                  backgroundColor: '#10B981',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Add Goal
              </button>
            </form>
          </div>
        )}

        {/* Goals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {goals.map(goal => {
            const progress = getProgressPercentage(goal.target_amount);
            const isCompleted = progress >= 100;
            
            return (
              <div key={goal.id} style={{ 
                padding: '24px', 
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: isCompleted ? '2px solid #10B981' : '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>{goal.goal_name}</h4>
                  <button 
                    onClick={() => handleDelete(goal.id)}
                    style={{ 
                      padding: '6px 8px', 
                      backgroundColor: '#EF4444',
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    Delete
                  </button>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Target:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>₹{parseFloat(goal.target_amount).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Progress:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>₹{portfolioValue.toFixed(2)}</span>
                  </div>
                  {goal.target_date && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>Target Date:</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>{new Date(goal.target_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#E5E7EB',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div style={{ 
                      width: `${progress}%`, 
                      height: '100%', 
                      backgroundColor: isCompleted ? '#10B981' : '#3B82F6',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <p style={{ 
                    textAlign: 'center', 
                    margin: 0, 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isCompleted ? '#10B981' : '#6B7280'
                  }}>
                    {progress.toFixed(1)}% Complete
                  </p>
                </div>
                
                {isCompleted && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#DCFCE7',
                    borderRadius: '6px', 
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#065F46'
                  }}>
                    🎉 Goal Achieved!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;