import React, { useState, useEffect } from 'react';
import { transactionAPI, portfolioAPI } from '../services/api';

const Portfolio = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 500); // Faster updates
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionAPI.getAll(),
        portfolioAPI.getSummary()
      ]);
      setTransactions(transactionsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0F172A', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 8px 0' }}>
            Portfolio Overview
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '16px' }}>
            Complete transaction history and portfolio analysis
          </p>
        </div>

        {/* Portfolio Summary */}
        <div style={{ 
          marginBottom: '32px', 
          padding: '32px', 
          backgroundColor: '#1E293B',
          borderRadius: '12px',
          border: '1px solid #334155',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '600', color: '#F8FAFC' }}>Portfolio Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>Total Investment</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0EA5E9' }}>₹{summary.totalInvestment || '0.00'}</div>
              <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            </div>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>Current Value</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#06B6D4' }}>₹{summary.currentValue || '0.00'}</div>
              <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            </div>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>Total P&L</div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: parseFloat(summary.totalProfitLoss || 0) >= 0 ? '#10B981' : '#EF4444' 
              }}>
                ₹{summary.totalProfitLoss || '0.00'}
              </div>
              <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            </div>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '8px' }}>ROI</div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: parseFloat(summary.roi || 0) >= 0 ? '#10B981' : '#EF4444' 
              }}>
                {summary.roi || '0.00'}%
              </div>
              <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div style={{ 
          backgroundColor: '#1E293B',
          borderRadius: '12px',
          border: '1px solid #334155',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '24px 24px 0 24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#F8FAFC' }}>
              Transaction History
              <span style={{ 
                marginLeft: '12px', 
                fontSize: '14px', 
                fontWeight: '400', 
                color: '#94A3B8',
                backgroundColor: '#0F172A',
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                {transactions.length} transactions
              </span>
            </h3>
          </div>
          
          {transactions.length === 0 ? (
            <div style={{ 
              padding: '60px 24px', 
              textAlign: 'center',
              color: '#94A3B8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No transactions yet</div>
              <div style={{ fontSize: '14px' }}>Start trading to see your transaction history</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0F172A' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Date</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Asset</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Type</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Quantity</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Price</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => {
                    const total = transaction.quantity * transaction.price;
                    return (
                      <tr key={transaction.id} style={{ 
                        backgroundColor: index % 2 === 0 ? '#1E293B' : '#0F172A',
                        borderTop: '1px solid #334155'
                      }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94A3B8' }}>
                          {new Date(transaction.transaction_date).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#F8FAFC' }}>
                          {transaction.asset_name}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '12px', 
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: transaction.transaction_type === 'Buy' ? '#10B981' : '#EF4444',
                            color: '#FFFFFF'
                          }}>
                            {transaction.transaction_type}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#F8FAFC' }}>
                          {transaction.quantity}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#F8FAFC' }}>
                          ₹{transaction.price}
                        </td>
                        <td style={{ 
                          padding: '16px 24px', 
                          textAlign: 'right', 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: transaction.transaction_type === 'Buy' ? '#EF4444' : '#10B981'
                        }}>
                          {transaction.transaction_type === 'Buy' ? '-' : '+'}₹{total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;