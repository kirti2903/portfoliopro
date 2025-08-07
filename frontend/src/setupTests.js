import '@testing-library/jest-dom';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

// Mock API calls
jest.mock('./services/api', () => ({
  assetAPI: {
    getAll: jest.fn(() => Promise.resolve({ data: [] })),
    create: jest.fn(() => Promise.resolve({ data: {} })),
    update: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  },
  portfolioAPI: {
    getSummary: jest.fn(() => Promise.resolve({ data: {} })),
    getDistribution: jest.fn(() => Promise.resolve({ data: [] }))
  },
  marketAPI: {
    getData: jest.fn(() => Promise.resolve({ data: { indices: [], topGainers: [], topLosers: [] } })),
    getSectors: jest.fn(() => Promise.resolve({ data: [] })),
    getNews: jest.fn(() => Promise.resolve({ data: [] }))
  },
  predefinedAssetAPI: {
    search: jest.fn(() => Promise.resolve({ data: [] }))
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});