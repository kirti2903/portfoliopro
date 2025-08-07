import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const MarketTrends = () => {
  const [marketData, setMarketData] = useState({
    indices: [
      { name: 'NIFTY 50', value: '19,674.25', change: '+234.50', changePercent: '+1.21%', trend: 'up' },
      { name: 'SENSEX', value: '65,953.48', change: '+789.23', changePercent: '+1.21%', trend: 'up' },
      { name: 'BANK NIFTY', value: '44,234.75', change: '-123.45', changePercent: '-0.28%', trend: 'down' },
      { name: 'NIFTY IT', value: '31,456.89', change: '+456.78', changePercent: '+1.47%', trend: 'up' }
    ],
    topGainers: [
      { name: 'Reliance', price: '2,456.75', change: '+5.67%' },
      { name: 'TCS', price: '3,234.50', change: '+4.23%' },
      { name: 'HDFC Bank', price: '1,567.25', change: '+3.89%' },
      { name: 'Infosys', price: '1,345.80', change: '+3.45%' }
    ],
    topLosers: [
      { name: 'Adani Ports', price: '756.45', change: '-4.56%' },
      { name: 'Bajaj Finance', price: '6,789.25', change: '-3.78%' },
      { name: 'Asian Paints', price: '3,123.45', change: '-2.89%' },
      { name: 'Maruti Suzuki', price: '9,876.50', change: '-2.34%' }
    ]
  });

  const [news] = useState([
    {
      title: "Indian Markets Rally on Strong Q3 Results",
      summary: "Nifty 50 gains 1.2% as major companies report better-than-expected earnings",
      time: "2 hours ago",
      category: "Markets"
    },
    {
      title: "RBI Maintains Repo Rate at 6.5%",
      summary: "Central bank keeps policy rates unchanged, focuses on inflation control",
      time: "4 hours ago",
      category: "Policy"
    },
    {
      title: "Tech Stocks Lead Market Recovery",
      summary: "IT sector outperforms with TCS and Infosys showing strong momentum",
      time: "6 hours ago",
      category: "Sectors"
    },
    {
      title: "FII Inflows Continue for Third Week",
      summary: "Foreign institutional investors pump ₹2,500 crores into Indian equities",
      time: "8 hours ago",
      category: "Investment"
    }
  ]);

  // Mock trend data
  const trendData = {
    labels: ['9:15', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '3:30'],
    datasets: [
      {
        label: 'NIFTY 50',
        data: [19440, 19520, 19580, 19620, 19650, 19680, 19674, 19674],
        borderColor: '#0EA5E9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'SENSEX',
        data: [65164, 65400, 65600, 65750, 65850, 65920, 65953, 65953],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const sectorData = {
    labels: ['IT', 'Banking', 'Pharma', 'Auto', 'FMCG', 'Energy'],
    datasets: [
      {
        label: 'Sector Performance (%)',
        data: [2.3, 1.8, -0.5, 1.2, 0.8, -1.1],
        backgroundColor: ['#10B981', '#0EA5E9', '#EF4444', '#06B6D4', '#8B5CF6', '#F59E0B'],
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
              <Bar data={sectorData} options={chartOptions} />
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