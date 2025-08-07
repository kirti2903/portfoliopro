import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { marketAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const MarketTrends = () => {
  const [marketData, setMarketData] = useState({
    indices: [
      { name: 'NIFTY 50', value: '19,674.25', change: '+234.50', changePercent: '+1.21%', trend: 'up' },
      { name: 'SENSEX', value: '65,953.48', change: '+789.23', changePercent: '+1.21%', trend: 'up' }
    ],
    topGainers: [
      { name: 'Reliance', price: '2,456.75', change: '+5.67%' },
      { name: 'TCS', price: '3,234.50', change: '+4.23%' }
    ],
    topLosers: [
      { name: 'Adani', price: '756.45', change: '-4.56%' },
      { name: 'Bajaj', price: '6,789.25', change: '-3.78%' }
    ]
  });
  const [sectorData, setSectorData] = useState([
    { name: 'Stocks', performance: 2.3 },
    { name: 'Mutual Funds', performance: 1.8 },
    { name: 'Crypto', performance: -0.5 }
  ]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchMarketData();
    fetchSectorData();
    fetchNews();
    const interval = setInterval(() => {
      fetchMarketData();
      fetchSectorData();
      fetchNews();
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await marketAPI.getData();
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchSectorData = async () => {
    try {
      const response = await marketAPI.getSectors();
      setSectorData(response.data);
    } catch (error) {
      console.error('Error fetching sector data:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await marketAPI.getNews();
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };



  // Live trend data
  const trendData = {
    labels: ['9:15', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '3:30'],
    datasets: marketData.indices.slice(0, 2).map((index, i) => ({
      label: index.name,
      data: Array.from({length: 8}, (_, j) => {
        const baseValue = parseFloat(index.value.replace(/,/g, ''));
        const variation = (Math.random() - 0.5) * 0.02;
        return baseValue * (1 + variation);
      }),
      borderColor: ['#0EA5E9', '#10B981'][i],
      backgroundColor: [`rgba(14, 165, 233, 0.1)`, `rgba(16, 185, 129, 0.1)`][i],
      borderWidth: 3,
      fill: true,
      tension: 0.4
    }))
  };

  const sectorChartData = {
    labels: sectorData.map(s => s.name),
    datasets: [
      {
        label: 'Performance (%)',
        data: sectorData.map(s => s.performance),
        backgroundColor: ['#10B981', '#0EA5E9', '#F59E0B'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94A3B8',
          padding: 20,
          usePointStyle: true
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
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 8px 0' }}>
            Market Trends
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '16px' }}>
            Live market data and financial news
          </p>
        </div>

        {/* Market Indices */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#F8FAFC', marginBottom: '16px' }}>Market Indices</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {marketData.indices.map((index, i) => (
              <div key={i} style={{ 
                padding: '20px', 
                backgroundColor: '#1E293B',
                borderRadius: '12px',
                border: '1px solid #334155',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#F8FAFC' }}>{index.name}</h3>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0EA5E9' }}>{index.value}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: index.trend === 'up' ? '#10B981' : '#EF4444'
                    }}>
                      {index.change}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: index.trend === 'up' ? '#10B981' : '#EF4444'
                    }}>
                      {index.changePercent}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ 
            padding: '24px', 
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Intraday Trends</h3>
            <div style={{ height: '300px' }}>
              <Line data={trendData} options={chartOptions} />
            </div>
          </div>
          
          <div style={{ 
            padding: '24px', 
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Sector Performance</h3>
            <div style={{ height: '300px' }}>
              <Bar data={sectorChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Top Gainers & Losers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ 
            padding: '24px', 
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Top Gainers</h3>
            {marketData.topGainers.map((stock, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < marketData.topGainers.length - 1 ? '1px solid #334155' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#F8FAFC' }}>{stock.name}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>₹{stock.price}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#10B981' }}>
                  {stock.change}
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            padding: '24px', 
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Top Losers</h3>
            {marketData.topLosers.map((stock, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < marketData.topLosers.length - 1 ? '1px solid #334155' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#F8FAFC' }}>{stock.name}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>₹{stock.price}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>
                  {stock.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market News */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: '#1E293B',
          borderRadius: '12px',
          border: '1px solid #334155',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>Market News</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {news.map((item, i) => (
              <div key={i} style={{ 
                padding: '16px',
                backgroundColor: '#0F172A',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#F8FAFC', flex: 1 }}>
                    {item.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      backgroundColor: '#0EA5E9', 
                      color: 'white', 
                      borderRadius: '12px' 
                    }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{item.time}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8', lineHeight: '1.5' }}>
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;