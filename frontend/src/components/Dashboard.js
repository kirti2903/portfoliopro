import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { portfolioAPI, assetAPI, transactionAPI } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [distribution, setDistribution] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [tradeAlert, setTradeAlert] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tradeType, setTradeType] = useState('Buy');
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [newAsset, setNewAsset] = useState({
    asset_name: '',
    asset_type: 'Stock',
    quantity: '',
    buy_price: '',
    current_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, distributionRes, assetsRes] = await Promise.all([
        portfolioAPI.getSummary(),
        portfolioAPI.getDistribution(),
        assetAPI.getAll()
      ]);
      setSummary(summaryRes.data);
      setDistribution(distributionRes.data);
      setAssets(assetsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 500); // Faster updates for real-time feel
    return () => clearInterval(interval);
  }, [fetchData]);

  const showTradeAlert = (alertData) => {
    setTradeAlert(alertData);
    setTimeout(() => setTradeAlert(null), 4000);
  };

  const openTradeModal = (asset, type) => {
    setSelectedAsset(asset);
    setTradeType(type);
    setTradeQuantity('');
    setShowTradeModal(true);
  };

  const closeTradeModal = () => {
    setShowTradeModal(false);
    setSelectedAsset(null);
    setTradeQuantity('');
  };

  const executeTrade = async () => {
    if (!tradeQuantity || parseFloat(tradeQuantity) <= 0) {
      showTradeAlert({ success: false, error: 'Please enter a valid quantity' });
      return;
    }

    if (tradeType === 'Sell' && parseFloat(tradeQuantity) > parseFloat(selectedAsset.quantity)) {
      showTradeAlert({ success: false, error: 'Insufficient quantity available!' });
      return;
    }

    try {
      await handleTrade(selectedAsset, tradeType, tradeQuantity);
      closeTradeModal();
    } catch (error) {
      console.error('Trade execution failed:', error);
      showTradeAlert({ success: false, error: 'Trade execution failed. Please try again.' });
    }
  };

  const getTotalAmount = () => {
    if (!tradeQuantity || !selectedAsset) return 0;
    return parseFloat(tradeQuantity) * selectedAsset.current_price;
  };

  const handleTrade = async (asset, type, quantity) => {
    try {
      const tradeQuantity = parseFloat(quantity);
      const totalAmount = tradeQuantity * parseFloat(asset.current_price);
      
      console.log('Processing trade:', { asset: asset.asset_name, type, quantity: tradeQuantity, price: asset.current_price });
      
      // Auto-create transaction
      const transactionResponse = await transactionAPI.create({
        asset_name: asset.asset_name,
        transaction_type: type,
        quantity: tradeQuantity,
        price: parseFloat(asset.current_price),
        transaction_date: new Date().toISOString().split('T')[0]
      });
      
      console.log('Transaction created:', transactionResponse.data);

      // Update asset
      const newQuantity = type === 'Buy' 
        ? parseFloat(asset.quantity) + tradeQuantity
        : parseFloat(asset.quantity) - tradeQuantity;

      console.log('Updating asset quantity from', asset.quantity, 'to', newQuantity);

      if (newQuantity > 0) {
        const updateResponse = await assetAPI.update(asset.id, {
          asset_name: asset.asset_name,
          asset_type: asset.asset_type,
          quantity: newQuantity,
          buy_price: parseFloat(asset.buy_price),
          current_price: parseFloat(asset.current_price),
          purchase_date: asset.purchase_date.split('T')[0]
        });
        console.log('Asset updated:', updateResponse.data);
      } else {
        const deleteResponse = await assetAPI.delete(asset.id);
        console.log('Asset deleted:', deleteResponse.data);
      }

      // Immediate data refresh
      await fetchData();
      
      // Professional success alert
      showTradeAlert({
        type: type,
        asset: asset.asset_name,
        quantity: tradeQuantity,
        price: asset.current_price,
        total: totalAmount,
        success: true
      });
      
    } catch (error) {
      console.error('Error processing trade:', error);
      console.error('Error details:', error.response?.data || error.message);
      showTradeAlert({ 
        success: false, 
        error: error.response?.data?.error || error.message || 'Trade failed. Please try again.' 
      });
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      const quantity = parseFloat(newAsset.quantity);
      const price = parseFloat(newAsset.buy_price);
      const totalAmount = quantity * price;
      
      await assetAPI.create(newAsset);
      await transactionAPI.create({
        asset_name: newAsset.asset_name,
        transaction_type: 'Buy',
        quantity: quantity,
        price: price,
        transaction_date: newAsset.purchase_date
      });
      
      await fetchData();
      
      showTradeAlert({
        type: 'Buy',
        asset: newAsset.asset_name,
        quantity: quantity,
        price: price,
        total: totalAmount,
        success: true,
        isNewAsset: true
      });
      
      setNewAsset({
        asset_name: '',
        asset_type: 'Stock',
        quantity: '',
        buy_price: '',
        current_price: '',
        purchase_date: new Date().toISOString().split('T')[0]
      });
      setShowAddAsset(false);
    } catch (error) {
      console.error('Error adding asset:', error);
      showTradeAlert({ success: false, error: 'Failed to add asset. Please try again.' });
    }
  };

  const pieData = {
    labels: distribution.map(item => item.name),
    datasets: [{
      data: distribution.map(item => parseFloat(item.value)),
      backgroundColor: ['#0EA5E9', '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'],
      borderWidth: 0
    }]
  };

  const lineData = {
    labels: distribution.map(item => item.name),
    datasets: [{
      label: 'Portfolio Value',
      data: distribution.map(item => parseFloat(item.value)),
      borderColor: '#0EA5E9',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0EA5E9',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94A3B8',
          padding: 15,
          usePointStyle: true,
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94A3B8' },
        grid: { color: '#334155' }
      },
      y: {
        ticks: { color: '#94A3B8' },
        grid: { color: '#334155' }
      }
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0F172A', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 8px 0' }}>
              Portfolio Dashboard
            </h1>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '16px' }}>
              Real-time portfolio tracking and management
            </p>
          </div>
          <button 
            onClick={() => setShowAddAsset(!showAddAsset)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#0EA5E9',
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0284C7'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0EA5E9'}
          >
            {showAddAsset ? '✕ Cancel' : '+ Add Asset'}
          </button>
        </div>

        {/* Add Asset Form */}
        {showAddAsset && (
          <div style={{ 
            marginBottom: '32px', 
            padding: '24px', 
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #334155'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Add New Asset</h3>
            <form onSubmit={handleAddAsset}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Asset Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Apple Inc."
                    value={newAsset.asset_name}
                    onChange={(e) => setNewAsset({...newAsset, asset_name: e.target.value})}
                    required
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #475569', 
                      width: '100%', 
                      fontSize: '14px',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Type</label>
                  <select
                    value={newAsset.asset_type}
                    onChange={(e) => setNewAsset({...newAsset, asset_type: e.target.value})}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #475569', 
                      width: '100%', 
                      fontSize: '14px',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC'
                    }}
                  >
                    <option value="Stock">📈 Stock</option>
                    <option value="Mutual Fund">🏦 Mutual Fund</option>
                    <option value="Crypto">₿ Crypto</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Quantity</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Quantity"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})}
                    required
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #475569', 
                      width: '100%', 
                      fontSize: '14px',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Buy Price"
                    value={newAsset.buy_price}
                    onChange={(e) => setNewAsset({...newAsset, buy_price: e.target.value, current_price: e.target.value})}
                    required
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid #475569', 
                      width: '100%', 
                      fontSize: '14px',
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC'
                    }}
                  />
                </div>
              </div>
              <button 
                type="submit"
                style={{ 
                  marginTop: '20px', 
                  padding: '12px 24px', 
                  backgroundColor: '#10B981',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Add Asset
              </button>
            </form>
          </div>
        )}
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {[
            { title: 'Total Investment', value: `₹${summary.totalInvestment || '0.00'}`, color: '#0EA5E9', icon: '💰' },
            { title: 'Current Value', value: `₹${summary.currentValue || '0.00'}`, color: '#06B6D4', icon: '📊' },
            { title: 'Profit/Loss', value: `₹${summary.totalProfitLoss || '0.00'}`, color: parseFloat(summary.totalProfitLoss) >= 0 ? '#10B981' : '#EF4444', icon: parseFloat(summary.totalProfitLoss) >= 0 ? '📈' : '📉' },
            { title: 'ROI', value: `${summary.roi || '0.00'}%`, color: parseFloat(summary.roi) >= 0 ? '#10B981' : '#EF4444', icon: '🎯' }
          ].map((item, index) => (
            <div key={index} style={{ 
              padding: '24px', 
              backgroundColor: '#1E293B',
              borderRadius: '12px', 
              border: '1px solid #334155',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>{item.title}</h3>
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
              </div>
              <p style={{ fontSize: '28px', margin: 0, fontWeight: '700', color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ 
            padding: '24px', 
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Asset Distribution</h3>
            <div style={{ height: '300px' }}>
              {distribution.length > 0 && <Pie data={pieData} options={{...chartOptions, maintainAspectRatio: false}} />}
            </div>
          </div>
          
          <div style={{ 
            padding: '24px', 
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Portfolio Performance</h3>
            <div style={{ height: '300px' }}>
              {distribution.length > 0 && <Line data={lineData} options={chartOptions} />}
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div style={{ 
          backgroundColor: '#1E293B',
          borderRadius: '12px',
          border: '1px solid #334155',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '24px 24px 0 24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Your Assets</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0F172A' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Asset</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Type</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Quantity</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Price</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Value</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>P&L</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, index) => {
                  const profitLoss = (asset.current_price - asset.buy_price) * asset.quantity;
                  const value = asset.quantity * asset.current_price;
                  return (
                    <tr key={asset.id} style={{ 
                      backgroundColor: index % 2 === 0 ? '#1E293B' : '#0F172A',
                      borderTop: '1px solid #334155'
                    }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#F8FAFC' }}>{asset.asset_name}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94A3B8' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: asset.asset_type === 'Stock' ? '#1E40AF' : asset.asset_type === 'Crypto' ? '#DC2626' : '#059669',
                          color: '#FFFFFF'
                        }}>
                          {asset.asset_type}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#F8FAFC' }}>{asset.quantity}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#F8FAFC' }}>₹{asset.current_price}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#0EA5E9' }}>₹{value.toFixed(2)}</td>
                      <td style={{ 
                        padding: '16px 24px', 
                        textAlign: 'right', 
                        fontSize: '14px',
                        fontWeight: '600',
                        color: profitLoss >= 0 ? '#10B981' : '#EF4444'
                      }}>
                        ₹{profitLoss.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => openTradeModal(asset, 'Buy')}
                            style={{ 
                              padding: '8px 16px', 
                              backgroundColor: '#10B981',
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
                          >
                            🟢 Buy
                          </button>
                          <button 
                            onClick={() => openTradeModal(asset, 'Sell')}
                            style={{ 
                              padding: '8px 16px', 
                              backgroundColor: '#EF4444',
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#DC2626'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#EF4444'}
                          >
                            🔴 Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Professional Trade Modal */}
        {showTradeModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              border: '2px solid #334155',
              boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
              width: '450px',
              maxWidth: '90vw',
              animation: 'slideUp 0.3s ease-out'
            }}>
              {/* Header */}
              <div style={{
                padding: '24px 24px 0 24px',
                borderBottom: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '28px' }}>{tradeType === 'Buy' ? '🟢' : '🔴'}</span>
                    {tradeType} {selectedAsset?.asset_name}
                  </h3>
                  <button
                    onClick={closeTradeModal}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  padding: '16px 0 20px 0'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Current Price</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#0EA5E9' }}>₹{selectedAsset?.current_price}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Available</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{selectedAsset?.quantity}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#F8FAFC' 
                  }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Enter quantity"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '18px',
                      fontWeight: '600',
                      backgroundColor: '#0F172A',
                      border: '2px solid #334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      textAlign: 'center'
                    }}
                    autoFocus
                  />
                </div>

                {/* Total Calculation */}
                {tradeQuantity && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: '2px solid #334155',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '14px' }}>Price per unit:</span>
                      <span style={{ color: '#0EA5E9', fontWeight: '600', fontSize: '16px' }}>₹{selectedAsset?.current_price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '14px' }}>Quantity:</span>
                      <span style={{ color: '#F8FAFC', fontWeight: '600', fontSize: '16px' }}>{tradeQuantity}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid #334155'
                    }}>
                      <span style={{ color: '#F8FAFC', fontWeight: '700', fontSize: '18px' }}>Total Amount:</span>
                      <span style={{
                        color: tradeType === 'Buy' ? '#EF4444' : '#10B981',
                        fontWeight: '700',
                        fontSize: '24px'
                      }}>
                        {tradeType === 'Buy' ? '-' : '+'}₹{getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={closeTradeModal}
                    style={{
                      flex: 1,
                      padding: '16px',
                      backgroundColor: '#475569',
                      color: '#F8FAFC',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#64748B'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#475569'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeTrade}
                    disabled={!tradeQuantity || parseFloat(tradeQuantity) <= 0}
                    style={{
                      flex: 2,
                      padding: '16px',
                      backgroundColor: !tradeQuantity || parseFloat(tradeQuantity) <= 0 
                        ? '#475569' 
                        : tradeType === 'Buy' ? '#10B981' : '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: '700',
                      cursor: !tradeQuantity || parseFloat(tradeQuantity) <= 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: !tradeQuantity || parseFloat(tradeQuantity) <= 0 ? 0.5 : 1
                    }}
                    onMouseOver={(e) => {
                      if (tradeQuantity && parseFloat(tradeQuantity) > 0) {
                        e.target.style.backgroundColor = tradeType === 'Buy' ? '#059669' : '#DC2626';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (tradeQuantity && parseFloat(tradeQuantity) > 0) {
                        e.target.style.backgroundColor = tradeType === 'Buy' ? '#10B981' : '#EF4444';
                      }
                    }}
                  >
                    {tradeType === 'Buy' ? '🟢 Execute Buy' : '🔴 Execute Sell'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Trade Alert */}
        {tradeAlert && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1001,
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              padding: '20px 24px',
              backgroundColor: tradeAlert.success ? '#1E293B' : '#7F1D1D',
              borderRadius: '12px',
              border: `2px solid ${tradeAlert.success ? '#10B981' : '#EF4444'}`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              minWidth: '320px',
              maxWidth: '400px'
            }}>
              {tradeAlert.success ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>✅</span>
                    <h4 style={{ margin: 0, color: '#10B981', fontSize: '18px', fontWeight: '700' }}>
                      {tradeAlert.isNewAsset ? 'Asset Added Successfully!' : 'Trade Executed Successfully!'}
                    </h4>
                  </div>
                  <div style={{ color: '#F8FAFC', fontSize: '14px', lineHeight: '1.5' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>{tradeAlert.type}</strong> {tradeAlert.quantity} units of <strong>{tradeAlert.asset}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Price per unit:</span>
                      <span style={{ fontWeight: '600', color: '#0EA5E9' }}>₹{tradeAlert.price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Quantity:</span>
                      <span style={{ fontWeight: '600' }}>{tradeAlert.quantity}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      paddingTop: '8px',
                      borderTop: '1px solid #334155',
                      marginTop: '8px'
                    }}>
                      <span style={{ fontWeight: '600' }}>Total Amount:</span>
                      <span style={{ 
                        fontWeight: '700', 
                        fontSize: '16px',
                        color: tradeAlert.type === 'Buy' ? '#EF4444' : '#10B981'
                      }}>
                        {tradeAlert.type === 'Buy' ? '-' : '+'}₹{tradeAlert.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>❌</span>
                    <h4 style={{ margin: 0, color: '#EF4444', fontSize: '18px', fontWeight: '700' }}>
                      Trade Failed
                    </h4>
                  </div>
                  <div style={{ color: '#F8FAFC', fontSize: '14px' }}>
                    {tradeAlert.error}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;