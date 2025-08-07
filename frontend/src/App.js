import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import MarketTrends from './components/MarketTrends';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'portfolio':
        return <Portfolio />;
      case 'market':
        return <MarketTrends />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'market', label: 'Market', icon: '📈' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A' }}>
      <nav style={{
        backgroundColor: '#1E293B',
        borderBottom: '1px solid #334155',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#0EA5E9', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                💎
              </div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#F8FAFC', 
                margin: 0 
              }}>
                Portfolio Pro
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: activeTab === item.id ? '#0EA5E9' : 'transparent',
                    color: activeTab === item.id ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== item.id) {
                      e.target.style.backgroundColor = '#334155';
                      e.target.style.color = '#F8FAFC';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== item.id) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#94A3B8';
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;