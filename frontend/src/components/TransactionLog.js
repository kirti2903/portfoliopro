import React, { useState, useEffect } from 'react';
import { transactionAPI, assetAPI } from '../services/api';

const TransactionLog = () => {
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asset_name: '',
    transaction_type: 'Buy',
    quantity: '',
    price: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
    fetchAssets();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await assetAPI.getAll();
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionAPI.create(formData);
      fetchTransactions();
      resetForm();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionAPI.delete(id);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      asset_name: '',
      transaction_type: 'Buy',
      quantity: '',
      price: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            Transaction Log
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
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        </div>

        {/* Add Transaction Form */}
        {showForm && (
          <div style={{ 
            marginBottom: '32px', 
            padding: '24px', 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>Add New Transaction</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Asset</label>
                  <select
                    value={formData.asset_name}
                    onChange={(e) => setFormData({...formData, asset_name: e.target.value})}
                    required
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  >
                    <option value="">Select Asset</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.asset_name}>
                        {asset.asset_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Type</label>
                  <select
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({...formData, transaction_type: e.target.value})}
                    style={{ 
                      padding: '10px 12px', 
                      borderRadius: '6px', 
                      border: '1px solid #D1D5DB', 
                      width: '100%',
                      fontSize: '14px',
                      backgroundColor: formData.transaction_type === 'Buy' ? '#DCFCE7' : '#FEE2E2'
                    }}
                  >
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Quantity</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Date</label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                    required
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
                Add Transaction
              </button>
            </form>
          </div>
        )}

        {/* Transactions Table */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #E2E8F0'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Asset</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Type</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Quantity</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Price</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id} style={{ 
                  backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB',
                  borderBottom: '1px solid #F3F4F6'
                }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{transaction.asset_name}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: transaction.transaction_type === 'Buy' ? '#DCFCE7' : '#FEE2E2',
                      color: transaction.transaction_type === 'Buy' ? '#065F46' : '#DC2626'
                    }}>
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{transaction.quantity}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>₹{transaction.price}</td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(transaction.id)}
                      style={{ 
                        padding: '6px 12px', 
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionLog;