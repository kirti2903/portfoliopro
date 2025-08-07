import React, { useState, useEffect } from 'react';
import { assetAPI, transactionAPI, predefinedAssetAPI } from '../services/api';

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tradeType, setTradeType] = useState('Buy');
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_type: 'Stock',
    quantity: '',
    buy_price: '',
    current_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAssetData, setSelectedAssetData] = useState(null);

  useEffect(() => {
    fetchAssets();
    loadPredefinedAssets();
  }, []);

  const loadPredefinedAssets = async () => {
    try {
      const response = await predefinedAssetAPI.search('');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error loading predefined assets:', error);
    }
  };



  // Real-time price updates for selected asset
  useEffect(() => {
    if (!selectedAssetData) return;

    const updatePrice = async () => {
      try {
        const response = await predefinedAssetAPI.getBySymbol(selectedAssetData.symbol);
        const updatedAsset = response.data;
        
        if (updatedAsset.current_price !== selectedAssetData.current_price) {
          setSelectedAssetData(updatedAsset);
          setFormData(prev => ({
            ...prev,
            current_price: updatedAsset.current_price
          }));
        }
      } catch (error) {
        console.error('Error updating price:', error);
      }
    };

    const interval = setInterval(updatePrice, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [selectedAssetData]);

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
      await assetAPI.create(formData);
      fetchAssets();
      resetForm();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetAPI.delete(id);
        fetchAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleTrade = (asset, type) => {
    setSelectedAsset(asset);
    setTradeType(type);
    setTradeQuantity('');
    setShowTradeModal(true);
  };

  const executeTrade = async () => {
    try {
      // Create transaction
      await transactionAPI.create({
        asset_name: selectedAsset.asset_name,
        transaction_type: tradeType,
        quantity: parseFloat(tradeQuantity),
        price: selectedAsset.current_price,
        transaction_date: new Date().toISOString().split('T')[0]
      });

      // Update asset quantity
      const newQuantity = tradeType === 'Buy' 
        ? selectedAsset.quantity + parseFloat(tradeQuantity)
        : selectedAsset.quantity - parseFloat(tradeQuantity);

      if (newQuantity > 0) {
        await assetAPI.update(selectedAsset.id, {
          ...selectedAsset,
          quantity: newQuantity
        });
      } else {
        await assetAPI.delete(selectedAsset.id);
      }

      fetchAssets();
      setShowTradeModal(false);
      alert(`✅ ${tradeType} executed successfully!`);
    } catch (error) {
      console.error('Error executing trade:', error);
      alert('❌ Error executing trade');
    }
  };

  const resetForm = () => {
    setFormData({
      asset_name: '',
      asset_type: 'Stock',
      quantity: '',
      buy_price: '',
      current_price: '',
      purchase_date: new Date().toISOString().split('T')[0]
    });
    setSuggestions([]);
    setSelectedAssetData(null);
    setShowForm(false);
  };

  const selectAsset = (asset) => {
    setFormData({
      ...formData,
      asset_name: asset.name,
      asset_type: asset.type,
      current_price: asset.current_price
    });
    setSelectedAssetData(asset);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            Asset Management
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
            {showForm ? 'Cancel' : '+ Add Asset'}
          </button>
        </div>

        {/* Add Asset Form */}
        {showForm && (
          <div style={{ 
            marginBottom: '32px', 
            padding: '24px', 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>Add New Asset</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Select Asset</label>
                  <select
                    value={selectedAssetData ? selectedAssetData.id : ''}
                    onChange={async (e) => {
                      if (e.target.value) {
                        const asset = suggestions.find(s => s.id == e.target.value);
                        if (asset) selectAsset(asset);
                      } else {
                        setSelectedAssetData(null);
                        setFormData({...formData, asset_name: '', asset_type: 'Stock', current_price: ''});
                      }
                    }}
                    onFocus={async () => {
                      try {
                        const response = await predefinedAssetAPI.search('');
                        setSuggestions(response.data);
                      } catch (error) {
                        console.error('Error loading assets:', error);
                      }
                    }}
                    required
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  >
                    <option value="">Choose an asset...</option>
                    {suggestions.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.symbol}) - ₹{asset.current_price}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Type</label>
                  <select
                    value={formData.asset_type}
                    onChange={(e) => setFormData({...formData, asset_type: e.target.value})}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  >
                    <option value="Stock">Stock</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Crypto">Crypto</option>
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
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter your purchase price"
                    value={formData.buy_price}
                    onChange={(e) => setFormData({...formData, buy_price: e.target.value})}
                    required
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                  />
                  {formData.buy_price && formData.current_price && formData.quantity && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: (parseFloat(formData.current_price) - parseFloat(formData.buy_price)) >= 0 ? '#D1FAE5' : '#FEE2E2',
                      border: `1px solid ${(parseFloat(formData.current_price) - parseFloat(formData.buy_price)) >= 0 ? '#10B981' : '#EF4444'}`
                    }}>
                      <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>Profit/Loss Preview:</div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: (parseFloat(formData.current_price) - parseFloat(formData.buy_price)) >= 0 ? '#059669' : '#DC2626'
                      }}>
                        {(parseFloat(formData.current_price) - parseFloat(formData.buy_price)) >= 0 ? '📈 Profit' : '📉 Loss'}: 
                        ₹{((parseFloat(formData.current_price) - parseFloat(formData.buy_price)) * parseFloat(formData.quantity)).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Current Price (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Current Price"
                      value={formData.current_price}
                      onChange={(e) => setFormData({...formData, current_price: e.target.value})}
                      required
                      style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                    />
                    {selectedAssetData && (
                      <div style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '12px',
                        color: '#059669',
                        fontWeight: '500'
                      }}>
                        Live
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
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
                Add Asset
              </button>
            </form>
          </div>
        )}

        {/* Assets Table */}
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
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Type</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Quantity</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Buy Price</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Current Price</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>P&L</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #E2E8F0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => {
                const profitLoss = (asset.current_price - asset.buy_price) * asset.quantity;
                return (
                  <tr key={asset.id} style={{ 
                    backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB',
                    borderBottom: '1px solid #F3F4F6'
                  }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{asset.asset_name}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: asset.asset_type === 'Stock' ? '#DBEAFE' : asset.asset_type === 'Crypto' ? '#FEE2E2' : '#D1FAE5',
                        color: asset.asset_type === 'Stock' ? '#1E40AF' : asset.asset_type === 'Crypto' ? '#DC2626' : '#065F46'
                      }}>
                        {asset.asset_type}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{asset.quantity}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>₹{asset.buy_price}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>₹{asset.current_price}</td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'right', 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: profitLoss >= 0 ? '#059669' : '#DC2626'
                    }}>
                      ₹{profitLoss.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleTrade(asset, 'Buy')}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#10B981',
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          Buy
                        </button>
                        <button 
                          onClick={() => handleTrade(asset, 'Sell')}
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
                          Sell
                        </button>
                        <button 
                          onClick={() => handleDelete(asset.id)}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#6B7280',
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Trade Modal */}
        {showTradeModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              width: '400px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
                {tradeType} {selectedAsset?.asset_name}
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Enter quantity"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', width: '100%', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '6px' }}>
                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Price per unit: ₹{selectedAsset?.current_price}</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                  Total: ₹{(parseFloat(tradeQuantity || 0) * parseFloat(selectedAsset?.current_price || 0)).toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowTradeModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeTrade}
                  disabled={!tradeQuantity}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: tradeType === 'Buy' ? '#10B981' : '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: tradeQuantity ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: tradeQuantity ? 1 : 0.5
                  }}
                >
                  Execute {tradeType}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetManagement;